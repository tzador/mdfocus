const { version } = await Bun.file("package.json").json();

await Bun.write("src/version.ts", `export const VERSION = '${version}';\n`);
