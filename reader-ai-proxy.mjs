import http from "node:http";

const PORT = Number(process.env.READER_AI_PROXY_PORT || 4320);
const MODEL = "deepseek-v4-pro";
const MAX_BODY_BYTES = 1_000_000;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json; charset=utf-8"
};

function sendJson(res, status, payload) {
  res.writeHead(status, corsHeaders);
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = "";
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request is too large for the local prototype proxy."));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on("end", () => resolve(body ? JSON.parse(body) : {}));
    req.on("error", reject);
  });
}

function compactText(value, max = 12000) {
  if (!value) return "";
  const text = String(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

function systemPromptFor(task) {
  const base = [
    "You are the local AI assistant inside a research reading app.",
    "Return only valid JSON. Do not wrap it in markdown.",
    "Use concise Chinese unless the user asks for another language.",
    "Respect that the source material may include OCR mistakes; mention uncertainty when relevant."
  ].join(" ");

  const prompts = {
    summary: `${base} Output shape: {"summary":["point 1","point 2","point 3"],"quote_candidates":["short quote"],"keywords":["keyword"]}.`,
    translate: `${base} Translate the selected or provided text. Output shape: {"source_language":"...","target_language":"zh-CN","translation":"...","notes":["..."]}.`,
    rewrite: `${base} Turn the material into a reusable research memo, outline, or draft paragraph. Output shape: {"title":"...","outline":["..."],"draft":"...","next_steps":["..."]}.`,
    connect: `${base} Explain why related local articles matter. Output shape: {"links":[{"title":"...","reason":"..."}],"synthesis":"..."}.`,
    chat: `${base} Answer the user's question using the provided article context. Output shape: {"answer":"...","used_context":["..."],"followups":["..."]}.`,
    extract: `${base} Clean up OCR and marked text from a photographed page. Output shape: {"cleaned_marked_text":["..."],"ocr_notes":["..."]}.`
  };

  return prompts[task] || prompts.chat;
}

function buildUserPayload(payload) {
  const article = payload.article || {};
  return {
    task: payload.task,
    locale: payload.locale || "zh-CN",
    userPrompt: compactText(payload.prompt, 2000),
    selectedText: compactText(payload.selection, 6000),
    text: compactText(payload.text),
    article: {
      title: compactText(article.title, 300),
      source: compactText(article.source, 120),
      summary: compactText(article.summary, 1200),
      tags: Array.isArray(article.tags) ? article.tags.slice(0, 12) : [],
      ocrText: compactText(article.ocrText, 6000),
      highlightedText: Array.isArray(article.highlightedText)
        ? article.highlightedText.map((item) => compactText(item.text || item, 800)).slice(0, 10)
        : []
    },
    relatedArticles: Array.isArray(payload.relatedArticles)
      ? payload.relatedArticles.slice(0, 5).map((item) => ({
          title: compactText(item.title, 220),
          summary: compactText(item.summary, 900),
          tags: Array.isArray(item.tags) ? item.tags.slice(0, 8) : [],
          reason: compactText(item.reason, 400)
        }))
      : []
  };
}

async function callDeepSeek(payload) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      body: {
        ok: false,
        task: payload.task,
        error: "DEEPSEEK_API_KEY is not set. Start the proxy with this environment variable."
      }
    };
  }

  const task = payload.task || "chat";
  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: systemPromptFor(task) },
        { role: "user", content: JSON.stringify(buildUserPayload({ ...payload, task })) }
      ],
      stream: false,
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.2,
      max_tokens: 1600
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      body: {
        ok: false,
        task,
        error: data.error?.message || `DeepSeek request failed with HTTP ${response.status}`
      }
    };
  }

  const content = data.choices?.[0]?.message?.content || "{}";
  let result;
  try {
    result = JSON.parse(content);
  } catch (_error) {
    result = { text: content };
  }

  return {
    ok: true,
    status: 200,
    body: {
      ok: true,
      task,
      result,
      usage: data.usage || null
    }
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && req.url === "/health") {
    sendJson(res, 200, {
      ok: true,
      model: MODEL,
      hasKey: Boolean(process.env.DEEPSEEK_API_KEY)
    });
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/ai") {
    sendJson(res, 404, { ok: false, error: "Not found" });
    return;
  }

  try {
    const payload = await readBody(req);
    const result = await callDeepSeek(payload);
    sendJson(res, result.status, result.body);
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error?.message || "Local AI proxy failed"
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Reader AI proxy listening on http://127.0.0.1:${PORT}`);
});
