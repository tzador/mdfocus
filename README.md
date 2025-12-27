# 📖 mdream

**Zero-config Markdown reading server** — beautifully render any folder of Markdown files in your browser.

Point `mdream` at a directory and instantly get a navigable, live-reloading documentation site with table of contents, syntax highlighting, and Mermaid diagrams.

---

## ✨ Features

- **📁 File Tree Navigation** — Browse your entire Markdown structure with an expandable sidebar
- **📑 Table of Contents** — Auto-generated from headings for quick navigation within pages
- **🔄 Live Reload** — Changes to `.md`/`.mdx` files are reflected instantly in the browser
- **🎨 Syntax Highlighting** — Beautiful code blocks for all major languages
- **📊 Mermaid Diagrams** — Render flowcharts, sequence diagrams, and more
- **📝 GitHub Flavored Markdown** — Tables, task lists, footnotes, and all GFM extensions
- **🖼️ Image Support** — Serves images and assets from your Markdown directory
- **💾 Scroll Preservation** — Remembers your position in both the tree and page content

---

## 🚀 Quick Start

```sh
npx mdream ./docs
```

Then open [http://localhost:4242](http://localhost:4242) in your browser.

### Options

```
Usage: mdream [options] [root]

Arguments:
  root                    Folder to read from (default: ".")

Options:
  -p, --port <number>     Port to listen on (default: "4242")
  -h, --help              Display help
```

---

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/) — JavaScript runtime & package manager
- [Just](https://just.systems/) — Command runner (`brew install just`)
- [Node.js](https://nodejs.org/) — For some build tooling (`brew install node`)

### Setup

```sh
# Clone the repository
git clone https://github.com/your-username/mdream.git
cd mdream

# Install dependencies
bun install
```

### Running the Dev Server

```sh
just dev ./samples
```

This starts both the backend server and React dev server with hot module replacement.

### Building

```sh
just build
```

Outputs the production bundle to `mdream/dist/`.

---

## 📁 Project Structure

```
mdream/
├── common/          # Shared types and schemas (Zod)
├── frontend/        # React app (Vite + TailwindCSS)
│   └── src/
│       ├── App.tsx
│       ├── Home.tsx         # File tree view
│       ├── Page.tsx         # Individual page view
│       ├── Markdown.tsx     # Markdown renderer
│       └── TableOfContents.tsx
├── mdream/          # Backend server (Express)
│   ├── bin/mdream   # CLI entrypoint
│   └── src/
│       └── mdream.ts
└── samples/         # Example Markdown files
```

---

## 📝 Supported Markdown Features

| Feature                              | Status |
| ------------------------------------ | ------ |
| Headings (H1-H6)                     | ✅     |
| Bold, Italic, Strikethrough          | ✅     |
| Links (internal & external)          | ✅     |
| Images                               | ✅     |
| Code blocks with syntax highlighting | ✅     |
| Tables                               | ✅     |
| Task lists                           | ✅     |
| Blockquotes                          | ✅     |
| Horizontal rules                     | ✅     |
| Mermaid diagrams                     | ✅     |
| Footnotes                            | ✅     |
| GFM Alerts                           | 🚧     |
| Math (LaTeX)                         | 🚧     |

---

## 🗺️ Roadmap

- [ ] Custom themes
- [ ] Font selection

---

## 📄 License

MIT
