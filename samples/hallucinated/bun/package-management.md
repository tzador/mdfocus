# Bun: Package Management

## Introduction

Bun includes a fast package manager that's compatible with npm, yarn, and pnpm.
It provides significant performance improvements while maintaining compatibility
with the Node.js ecosystem.

This guide covers Bun's package management features, best practices, and
optimization strategies.

## Basic Commands

### Installing Packages

```bash
# Install package
bun add express

# Install dev dependency
bun add -d typescript @types/node

# Install exact version
bun add express@4.18.2

# Install from GitHub
bun add github:user/repo

# Install from local path
bun add ./local-package
```

### Removing Packages

```bash
# Remove package
bun remove express

# Remove dev dependency
bun remove -d typescript
```

### Updating Packages

```bash
# Update all packages
bun update

# Update specific package
bun update express

# Update to latest
bun update express@latest
```

## Lockfile Management

### Bun.lockb

**Binary lockfile format:**
- Faster to read/write
- Smaller file size
- Better performance
- Binary format (not human-readable)

```bash
# Generate lockfile
bun install

# Creates bun.lockb (binary format)
```

### Lockfile Best Practices

**Version control:**
```bash
# Commit lockfile
git add bun.lockb
git commit -m "Add lockfile"

# Don't ignore lockfile
# Keep it in version control
```

**Regenerating:**
```bash
# Delete and regenerate
rm bun.lockb
bun install
```

## Workspace Support

### Monorepo Setup

**Workspace structure:**
```
workspace/
├── packages/
│   ├── api/
│   │   ├── package.json
│   │   └── src/
│   ├── web/
│   │   ├── package.json
│   │   └── src/
│   └── shared/
│       ├── package.json
│       └── src/
├── package.json
└── bun.lockb
```

**Root package.json:**
```json
{
  "name": "workspace",
  "private": true,
  "workspaces": [
    "packages/*"
  ]
}
```

### Workspace Commands

```bash
# Install all workspace dependencies
bun install

# Add to specific workspace
bun add express --filter api

# Run script in workspace
bun run --filter api dev

# Run in all workspaces
bun run --filter '*' build
```

## Performance Features

### Fast Installation

**Speed advantages:**
- **10-100x faster** than npm
- Parallel package installation
- Efficient dependency resolution
- Fast lockfile parsing

### Caching

**Automatic caching:**
```bash
# Bun caches packages automatically
# Cache location: ~/.bun/install/cache

# Clear cache if needed
rm -rf ~/.bun/install/cache
```

### Parallel Installation

**Automatic parallelization:**
- Installs packages in parallel
- Faster dependency resolution
- Efficient network usage

## Compatibility

### npm Compatibility

**Works with npm packages:**
```bash
# Install any npm package
bun add lodash
bun add express
bun add react

# Works with package.json from npm projects
bun install
```

### yarn/pnpm Compatibility

**Can use existing lockfiles:**
```bash
# Install from yarn.lock
bun install

# Install from pnpm-lock.yaml
bun install

# Bun will use existing lockfile or create bun.lockb
```

## Package.json Scripts

### Running Scripts

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build ./src/index.ts --outdir ./dist",
    "start": "bun run dist/index.js",
    "test": "bun test"
  }
}
```

```bash
# Run script
bun run dev

# Or shorthand
bun dev

# Run with arguments
bun run dev -- --port 3000
```

### Script Execution

**Fast script execution:**
- Direct execution (no subprocess)
- Fast startup time
- TypeScript support built-in

## Dependency Management

### Peer Dependencies

```bash
# Install peer dependencies
bun add react react-dom

# Bun handles peer dependencies automatically
```

### Optional Dependencies

```json
{
  "optionalDependencies": {
    "fsevents": "^2.0.0"
  }
}
```

### Bundled Dependencies

```json
{
  "bundleDependencies": [
    "local-package"
  ]
}
```

## Advanced Features

### Overrides

**Override package versions:**
```json
{
  "overrides": {
    "lodash": "4.17.21"
  }
}
```

### Resolutions

**Resolve dependency conflicts:**
```json
{
  "resolutions": {
    "package-name": "1.2.3"
  }
}
```

### Link Protocol

**Link local packages:**
```bash
# Link package
bun link

# Use linked package
bun link my-package
```

## Best Practices

### Lockfile Management

1. **Commit lockfile:** Always commit bun.lockb
2. **Don't ignore:** Keep in version control
3. **Regenerate carefully:** Only when needed
4. **Team consistency:** Everyone uses same lockfile

### Dependency Management

1. **Use exact versions:** For production dependencies
2. **Regular updates:** Keep dependencies updated
3. **Security audits:** Check for vulnerabilities
4. **Minimize dependencies:** Only install what's needed

### Workspace Management

1. **Organize logically:** Group related packages
2. **Shared dependencies:** Use workspace root
3. **Independent versions:** Each package can have own version
4. **Script organization:** Use workspace scripts

## Troubleshooting

### Installation Issues

**Clear cache:**
```bash
rm -rf ~/.bun/install/cache
bun install
```

**Regenerate lockfile:**
```bash
rm bun.lockb
bun install
```

**Permission issues:**
```bash
# Fix permissions
chmod -R 755 ~/.bun
```

### Dependency Conflicts

**Check conflicts:**
```bash
# List installed packages
bun pm ls

# Check for conflicts
bun pm why package-name
```

**Resolve conflicts:**
```json
{
  "overrides": {
    "conflicting-package": "resolved-version"
  }
}
```

## Performance Tips

### Fast Installation

1. **Use Bun's package manager:** Faster than npm/yarn
2. **Parallel installation:** Automatic
3. **Efficient caching:** Built-in
4. **Binary lockfile:** Faster parsing

### Optimization

1. **Minimize dependencies:** Only install needed packages
2. **Use workspaces:** For monorepos
3. **Regular cleanup:** Remove unused packages
4. **Cache management:** Clear when needed

## Conclusion

Bun's package management:
- **Fast:** 10-100x faster than npm
- **Compatible:** Works with npm/yarn/pnpm
- **Efficient:** Parallel installation, caching
- **Modern:** Binary lockfile, workspace support

**Key takeaways:**
- Use `bun add` for installation
- Commit bun.lockb to version control
- Use workspaces for monorepos
- Leverage speed advantages
- Follow best practices

Remember: Bun's package manager provides significant performance improvements
while maintaining full compatibility with the Node.js ecosystem.
