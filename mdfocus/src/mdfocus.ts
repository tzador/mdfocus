import chalk from "chalk";
import { Command } from "commander";
import express from "express";
import fastGlob from "fast-glob";
import {
  FileSchema,
  type FileType,
  TreeSchema,
  type TreeType,
} from "mdfocus-common/src/common";
import { watch } from "node:fs";
import { access, readFile } from "node:fs/promises";
import path from "path";
import { treePathCompare } from "./utils";

const program = new Command();

program
  .name("mdfocus")
  .description("Zero-config Markdown reading server")
  .argument("[root]", "Folder to read from", ".")
  .option("-p, --port <number>", "Port to listen on", "4242")
  // .option("--open", "Open browser automatically") // TODO: or hit enter Y/n to open browser
  .parse();

const opts = program.opts();
const root = path.resolve(program.args[0] ?? ".");

const app = express();

app.get("/api/root", async (_req, res) => {
  const paths = (
    await fastGlob("**/*.{md,mdx}", {
      cwd: root,
      ignore: ["**/node_modules/**", "**/.git/**"],
      absolute: false,
    })
  ).toSorted(treePathCompare);

  const result: TreeType = {
    root,
    paths,
  };
  res.json(TreeSchema.parse(result));
});

app.get("/api/file/*path", async (req, res) => {
  const pathParam = req.url.replace(/^\/api\/file\//, "");
  const filePath = pathParam || "";

  if (!filePath.endsWith(".md") && !filePath.endsWith(".mdx")) {
    return res.status(404).json({ error: "File must end with .md or .mdx" });
  }

  const fullPath = path.join(root, filePath);

  const fileExists = await access(fullPath)
    .then(() => true)
    .catch(() => false);

  if (!fileExists) {
    return res.status(404).json({ error: "File not found" });
  }

  const content = await readFile(fullPath, "utf-8");

  const result: FileType = {
    path: filePath,
    content: content,
  };

  res.json(FileSchema.parse(result));
});

app.get("/api/watch", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const ac = new AbortController();

  watch(root, { recursive: true, signal: ac.signal }, (eventType, filename) => {
    if (!filename) return;

    // Filter for markdown files only
    if (!filename.endsWith(".md") && !filename.endsWith(".mdx")) return;

    // Skip node_modules and .git
    if (filename.includes("node_modules") || filename.includes(".git")) return;

    res.write(
      `data: ${JSON.stringify({ event: eventType, path: filename })}\n\n`
    );
  });

  req.on("close", () => {
    ac.abort();
  });
});

const frontendDir = process.env.FRONTEND_DIR;

app.use(async (req, res, next) => {
  if (req.path.endsWith(".md") || req.path.endsWith(".mdx")) {
    next();
    return;
  }

  const fullPath = path.join(path.resolve(root), req.path.slice(1));
  try {
    await access(fullPath);
    res.sendFile(fullPath);
  } catch (error) {
    next();
  }
});

if (frontendDir) {
  app.use(express.static(frontendDir));
  app.use((req, res) => {
    res.sendFile(path.join(path.resolve(frontendDir), "index.html"));
  });
}

app.listen(opts.port, "localhost", () => {
  // TODO: handle host and lan options
  const addresses = ["http://localhost:" + opts.port];
  console.log(`${chalk.green("mdfocus")} is serving markdown files`);
  console.log(`from:`);
  console.log(`  ${chalk.yellow(root)}`);
  console.log(`on:`);
  for (const address of addresses) {
    console.log("  " + chalk.blue(address));
  }
});
