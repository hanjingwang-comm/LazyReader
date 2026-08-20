# LazyReader

![LazyReader preview](assets/preview.png)

## Intro(en)

LazyReader is a local-first Reader Mac App prototype for collecting, organizing, reading, editing, and extracting text from research materials. It is currently a self-contained HTML prototype with browser-side local state.

### Highlights

- **Local-first reading library**: Manage attachments, Markdown items, folders, tags, favorites, and filters in one workspace.
- **Real prototype state**: Folder creation, article deletion, favorite toggling, tag filters, live counts, and `localStorage` persistence are implemented.
- **Daily reading check-ins**: A sidebar calendar tracks book titles, pages, and reading status; completed dates show a book icon and reveal their saved records.
- **Attachment ingestion**: Import images and PDFs through a pending-import flow; multiple files create multiple library items.
- **Focused OCR workflow**: Image imports create an editable body draft, prioritizing marked/highlighted text and falling back to the full OCR result when needed.
- **Unified content editor**: OCR items use the same editable title, body, and tag structure as every other library item.
- **Consistent reading view**: Attachment, Markdown, and OCR content share one reading layout regardless of their source.
- **OCR confirmation workflow**: New image items open in edit mode, and extracted text only appears in reading mode after the correction is saved.

### Project Files

- `Reader Mac App Prototype.html` — the interactive prototype and browser-side state.
- `_d_meta.json` — design prototype metadata.
- `assets/preview.png` — README preview image.

### Run Locally

Serve the prototype over HTTP from the parent folder:

```bash
python3 -m http.server 4318 --directory ..
```

Open:

```text
http://127.0.0.1:4318/reader-mac-app/Reader%20Mac%20App%20Prototype.html
```

### Current Limitations

- This is not yet a packaged native Mac app.
- Files are not copied into a real local file store.
- Persistent data uses browser `localStorage`, not SQLite/Core Data.
- OCR depends on browser-side Tesseract loading and image quality.

### Next Engineering Steps

- Wrap the prototype in Electron, Tauri, or Swift for native Mac capabilities.
- Replace `localStorage` with SQLite/Core Data.
- Add real local file import, storage, deletion, and search indexing.
- Package the OCR runtime and language data for reliable offline extraction.

---

## 介绍（中）

LazyReader 是一个本地优先的 Reader Mac App 原型，用于采集、整理、阅读、编辑和提取研究资料中的文字。当前版本是一个使用浏览器本地状态的自包含 HTML 交互原型。

### 功能亮点

- **本地优先资料库**：在同一个工作区中管理附件、Markdown 条目、文件夹、标签、收藏和筛选。
- **真实原型状态**：已实现文件夹创建、文章删除、收藏切换、标签筛选、真实数量统计和 `localStorage` 持久化。
- **每日阅读打卡**：右侧日历可以记录书名、页数和阅读状态；完成打卡的日期会显示书本图标，并展示当天的本地记录。
- **附件导入流程**：支持图片和 PDF 的待导入状态；多文件导入会创建多条资料卡。
- **聚焦的 OCR 工作流**：图片导入后生成可编辑正文草稿，优先采用画线/高亮内容，未检测到画线时回退到 OCR 全文。
- **统一内容编辑器**：OCR 条目与其他条目使用相同的标题、正文和标签结构，可以继续补充或重写内容。
- **一致的阅读视图**：附件、Markdown 和 OCR 内容不再因来源不同而使用不同的阅读布局。
- **OCR 确认流程**：新导入的图片条目会自动进入编辑模式，只有保存修正后，提取文字才会出现在阅读模式中。

### 项目文件

- `Reader Mac App Prototype.html` — 交互原型和浏览器端状态逻辑。
- `_d_meta.json` — 设计原型元数据。
- `assets/preview.png` — README 预览图。

### 本地运行

从父目录启动 HTTP 服务：

```bash
python3 -m http.server 4318 --directory ..
```

打开：

```text
http://127.0.0.1:4318/reader-mac-app/Reader%20Mac%20App%20Prototype.html
```

### 当前限制

- 当前还不是已打包的原生 Mac App。
- 文件还没有复制到真实本地资料库。
- 持久化数据使用浏览器 `localStorage`，不是 SQLite/Core Data。
- OCR 稳定性依赖浏览器端 Tesseract 加载和图片质量。

### 后续工程方向

- 使用 Electron、Tauri 或 Swift 封装成原生 Mac App。
- 用 SQLite/Core Data 替代 `localStorage`。
- 增加真实本地文件导入、存储、删除和搜索索引。
- 打包 OCR 运行时和语言数据，实现稳定的离线文字提取。
