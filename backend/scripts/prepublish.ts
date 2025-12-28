/**
 * Removes workspace dependencies from package.json before publishing.
 * Since the code is bundled, workspace packages aren't needed at runtime.
 */

const packageJsonPath = "./package.json";
const packageJson = await Bun.file(packageJsonPath).json();
const publishPackageJsonPath = "./publish/package.json";

// Remove workspace dependencies (they're bundled into the build)
if (packageJson.dependencies) {
  for (const [name, version] of Object.entries(packageJson.dependencies)) {
    if (typeof version === "string" && version.startsWith("workspace:")) {
      delete packageJson.dependencies[name];
      console.log(`Removed bundled workspace dependency: ${name}`);
    }
  }
}

await Bun.write(
  publishPackageJsonPath,
  JSON.stringify(packageJson, null, 2) + "\n"
);
console.log("package.json prepared for publishing");
