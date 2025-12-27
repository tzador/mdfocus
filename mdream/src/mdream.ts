import chalk from "chalk";
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

const program = new Command();

program
  .name("mdream")
  .description("Zero-config Markdown reading server")
  .argument("[root]", "Folder to read from", ".")
  .option("-p, --port <number>", "Port to listen on", "4242")
  // .option("--host <host>", "Host to bind to", "127.0.0.1")
  // .option("--lan", "Bind to all interfaces (same as --host 0.0.0.0)")
  // .option("--theme <name>", "UI theme to use")
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
  ).toSorted();

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

const frontendDir = process.env.FRONTEND_DIR;

if (frontendDir) {
  app.use(express.static(frontendDir));
  app.use((req, res) => {
    res.sendFile(path.join(path.resolve(frontendDir), "index.html"));
  });
}

app.listen(opts.port, () => {
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
