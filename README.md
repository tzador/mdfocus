<h1 align="center">📖 mdfocus</h1>

<p align="center">
  <strong>Distraction-free Markdown reader</strong><br/>
  For the age of LLM-generated content.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/mdfocus"><img src="https://img.shields.io/npm/v/mdfocus.svg?style=flat-square&color=brightgreen" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/mdfocus"><img src="https://img.shields.io/npm/dm/mdfocus.svg?style=flat-square&color=blue" alt="npm downloads" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-yellow.svg?style=flat-square" alt="license" /></a>
</p>

---

LLMs generate Markdown. Lots of it — notes, docs, wikis, research dumps. **mdfocus** gives you a clean, focused way to read it all. Point it at any folder and start reading. No build step, no config, no distractions.

Live-reloading, table of contents, syntax highlighting, and Mermaid diagrams included.

## 🎯 Philosophy

| mdfocus is...                       | mdfocus is NOT...              |
| ----------------------------------- | ------------------------------ |
| A reader for your Markdown files    | A static site generator        |
| For consuming LLM-generated content | For publishing docs to the web |
| Zero-config, instant startup        | A build pipeline               |
| Distraction-free, focused interface | A blogging platform            |

If you want to build and deploy documentation, use [Docusaurus](https://docusaurus.io/), [VitePress](https://vitepress.dev/), or [Astro](https://astro.build/). If you want to _read_ your Markdown right now with zero friction — use mdfocus.

## 🚀 Quick Start

```sh
npx mdfocus ~/notes
```

Open [http://localhost:4242](http://localhost:4242) — that's it!

### Global Installation

```sh
npm install -g mdfocus
mdfocus ~/claude-exports
mdfocus ~/chatgpt-docs
mdfocus ~/wiki
```

### CLI Options

```
Usage: mdfocus [options] [root]

Arguments:
  root                    Folder to read from (default: current directory)

Options:
  -p, --port <number>     Port to listen on (default: 4242)
  -h, --help              Display help
```

---

## ✨ Features

| Feature                         | Description                                                |
| ------------------------------- | ---------------------------------------------------------- |
| 🧘 **Focus Mode**               | Clean, minimal interface — just your content, nothing else |
| 🚦 **Reading Status**           | Mark files with 🟡 🟢 🔴 or none — track what you've read  |
| 📑 **Table of Contents**        | Auto-generated from headings for quick in-page navigation  |
| 🔄 **Live Reload**              | Changes to `.md` / `.mdx` files reflect instantly          |
| 🎨 **Syntax Highlighting**      | Beautiful code blocks for 100+ languages                   |
| 📊 **Mermaid Diagrams**         | Flowcharts, sequence diagrams, ERDs, and more              |
| 📝 **GitHub Flavored Markdown** | Tables, task lists, footnotes, alerts                      |
| 🖼️ **Asset Serving**            | Images and files from your Markdown directory              |
| 💾 **Scroll Memory**            | Remembers your position in tree and content                |
| 🌙 **Dark Mode**                | Easy on the eyes, day or night                             |

---

## 📝 Markdown Support

| Feature                               | Status |
| ------------------------------------- | ------ |
| Headings, bold, italic, strikethrough | ✅     |
| Links (internal & external)           | ✅     |
| Images                                | ✅     |
| Code blocks with syntax highlighting  | ✅     |
| Tables                                | ✅     |
| Task lists                            | ✅     |
| Blockquotes                           | ✅     |
| Horizontal rules                      | ✅     |
| Mermaid diagrams                      | ✅     |
| Footnotes                             | ✅     |
| GFM Alerts                            | 🚧     |
| Math (LaTeX)                          | 🚧     |

---

## 🛠️ Development

### Prerequisites

- [Bun](https://bun.sh/) — JavaScript runtime & package manager
- [Just](https://just.systems/) — Command runner (`brew install just`)
- [Node.js](https://nodejs.org/) — For build tooling

### Setup

```sh
git clone https://github.com/tzador/mdfocus.git
cd mdfocus
bun install
```

### Dev Server

```sh
just dev ./samples
```

Starts the backend and React dev server with HMR.

### Build

```sh
just build
```

Outputs production bundle to `mdfocus/dist/`.

---

## 📁 Project Structure

```
mdfocus/               # Bun monorepo
├── common/            # Shared types & Zod schemas
├── frontend/          # React app (Vite + Tailwind)
├── mdfocus/           # Backend server (Express)
└── samples/           # Example Markdown files
```

---

## 📄 License

MIT © [tzador](https://github.com/tzador)
