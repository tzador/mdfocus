import chalk from "chalk";
import chokidar from "chokidar";
import { Command } from "commander";
import express from "express";
import fastGlob from "fast-glob";
import { access, readFile } from "fs/promises";
import {
  FileSchema,
  type FileType,
  TreeSchema,
  type TreeType,
} from "mdream-common/src/common";
import path from "path";
import { treePathCompare } from "./utils";

const program = new Command();

program
  .name("mdream")
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

  const watcher = chokidar.watch(root, {
    ignored: [
      "**/node_modules/**",
      "**/.git/**",
      (filePath: string, stats) =>
        !!stats?.isFile() &&
        !filePath.endsWith(".md") &&
        !filePath.endsWith(".mdx"),
    ],
    ignoreInitial: true,
  });

  const sendEvent = (event: string, filePath: string) => {
    res.write(`data: ${JSON.stringify({ event, path: filePath })}\n\n`);
  };

  watcher.on("add", (filePath) => sendEvent("add", filePath));
  watcher.on("change", (filePath) => sendEvent("change", filePath));
  watcher.on("unlink", (filePath) => sendEvent("unlink", filePath));

  watcher.on("error", (error) => {
    console.error("chokidar error:", error);
  });

  req.on("close", () => {
    watcher.close();
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
  console.log(`${chalk.green("mdream")} is serving markdown files`);
  console.log(`from:`);
  console.log(`  ${chalk.yellow(root)}`);
  console.log(`on:`);
  for (const address of addresses) {
    console.log("  " + chalk.blue(address));
  }
});
