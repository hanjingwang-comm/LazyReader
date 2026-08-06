# LazyReader

LazyReader is a local-first Reader Mac App prototype for collecting, organizing, reading, editing, and AI-processing research materials. The current version is a self-contained HTML prototype with a small local Node proxy for DeepSeek calls.

## What Works Now

- Local library UI for URLs, attachments, Markdown notes, RSS previews, folders, tags, favorites, and filters.
- Real folder creation and deletion, article deletion, favorite toggling, type filters, and live item counts.
- Attachment import flow for images, PDFs, and videos with pending import state and multiple item creation.
- Image OCR workflow with marked/highlighted text extraction UI, OCR full text display, manual correction, and editable OCR sections.
- Read/edit/notes modes for each item, including editable OCR output for image-based entries.
- AI sidebar, Cmd+K command palette, selection actions, and local DeepSeek proxy integration.
- Local prototype persistence through `localStorage`.

## Prototype Architecture

- `Reader Mac App Prototype.html` contains the full interactive UI and browser-side state.
- `reader-ai-proxy.mjs` exposes a local `POST /api/ai` endpoint and forwards text-only AI tasks to DeepSeek.
- `_d_meta.json` stores design-prototype metadata.

The DeepSeek API key is intentionally not stored in the frontend, source code, or `localStorage`. The proxy reads it from `DEEPSEEK_API_KEY`.

## Run Locally

Serve the prototype over HTTP:

```bash
python3 -m http.server 4318 --directory ..
```

Open:

```text
http://127.0.0.1:4318/reader-mac-app/Reader%20Mac%20App%20Prototype.html
```

Start the optional DeepSeek proxy:

```bash
DEEPSEEK_API_KEY="<your-key>" node reader-ai-proxy.mjs
```

Then use the AI sidebar, command palette, or selection actions in the prototype.

## Current Limitations

- This is not yet a packaged native Mac app.
- URL fetching, RSS subscription, and social-media ingestion are mock flows.
- Files are not copied into a real local file store.
- Persistent data uses browser `localStorage`, not SQLite/Core Data.
- OCR depends on browser-side Tesseract loading and image quality.
- A pure browser prototype cannot auto-start the local DeepSeek proxy; that requires Electron, Tauri, or Swift.

## Next Engineering Steps

- Wrap the prototype in Electron, Tauri, or Swift for native Mac capabilities.
- Replace `localStorage` with SQLite/Core Data.
- Add real local file import, storage, deletion, and search indexing.
- Store API keys in macOS Keychain.
- Auto-start the AI helper from the native app layer.
- Replace mock URL/RSS ingestion with real parsers and background jobs.
