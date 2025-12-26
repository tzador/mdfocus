# Bun: Getting Started

## Introduction

Bun is a fast all-in-one JavaScript runtime, bundler, test runner, and package
manager. It's designed to be a drop-in replacement for Node.js with significant
performance improvements.

This guide provides an introduction to Bun, its advantages, and how to get
started.

## What is Bun?

### Overview

Bun is a JavaScript runtime built from scratch using:
- **JavaScriptCore engine** (Safari's engine) instead of V8
- **Zig programming language** for performance
- **Native implementations** of many Node.js APIs

### Key Features

**Runtime:**
- Fast JavaScript/TypeScript execution
- Built-in bundler and transpiler
- Native support for many Node.js APIs
- Fast startup time

**Package Manager:**
- Fast package installation
- Works with npm, yarn, pnpm packages
- Lockfile support
- Workspace support

**Test Runner:**
- Built-in test runner
- Fast test execution
- Jest-compatible API

**Bundler:**
- Fast bundling
- Tree shaking
- Code splitting
- TypeScript support

## Advantages

### Performance

**Speed improvements:**
- **3-4x faster** than Node.js for many operations
- **10-100x faster** package installation
- **Lower memory usage**
- **Faster startup time**

### Developer Experience

**Better DX:**
- All-in-one tool (no need for separate bundlers)
- Built-in TypeScript support
- Fast hot reload
- Better error messages

### Compatibility

**Node.js compatibility:**
- Runs most Node.js code without changes
- Supports npm packages
- Compatible with many Node.js APIs
- Can use Node.js modules

## Installation

### macOS and Linux

```bash
# Install with curl
curl -fsSL https://bun.sh/install | bash

# Or with npm
npm install -g bun
```

### Windows

```bash
# Using PowerShell
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Verify Installation

```bash
# Check version
bun --version

# Check installation path
which bun
```

## First Steps

### Running JavaScript

```bash
# Run a JavaScript file
bun run index.js

# Run with TypeScript (no compilation needed)
bun run index.ts
```

### Creating a Project

```bash
# Create new project
bun create my-app

# Or initialize manually
mkdir my-app
cd my-app
bun init
```

### Package Management

```bash
# Install package
bun add express

# Install dev dependency
bun add -d typescript @types/node

# Install from package.json
bun install

# Remove package
bun remove express
```

## Basic Usage

### Running Scripts

```json
// package.json
{
  "scripts": {
    "dev": "bun run index.ts",
    "start": "bun run index.js",
    "test": "bun test"
  }
}
```

```bash
# Run script
bun run dev

# Or directly
bun dev
```

### TypeScript Support

**No configuration needed:**
```typescript
// index.ts
console.log("Hello from Bun!");

// Run directly
bun run index.ts
```

**With tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler"
  }
}
```

### Built-in APIs

**Native fetch (no need for node-fetch):**
```typescript
const response = await fetch('https://api.example.com/data');
const data = await response.json();
console.log(data);
```

**File system:**
```typescript
import { readFile, writeFile } from 'fs/promises';

const content = await readFile('file.txt', 'utf-8');
await writeFile('output.txt', content);
```

## Web Server

### Simple HTTP Server

```typescript
// server.ts
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    return new Response("Hello from Bun!");
  },
});

console.log(`Server running at http://localhost:${server.port}`);
```

### Express-like Server

```typescript
// Using Bun's native server
const server = Bun.serve({
  port: 3000,
  fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/') {
      return new Response("Home page");
    }
    
    if (url.pathname === '/api') {
      return Response.json({ message: "API response" });
    }
    
    return new Response("Not found", { status: 404 });
  },
});
```

### With Express

```typescript
// Works with Express too
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Bun + Express!' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## Testing

### Built-in Test Runner

```typescript
// test.ts
import { test, expect } from 'bun:test';

test('addition', () => {
  expect(1 + 1).toBe(2);
});

test('async operation', async () => {
  const result = await fetch('https://api.example.com');
  expect(result.ok).toBe(true);
});
```

```bash
# Run tests
bun test

# Watch mode
bun test --watch
```

## Bundling

### Bundle Application

```bash
# Bundle for production
bun build ./index.ts --outdir ./dist

# Bundle with minification
bun build ./index.ts --outdir ./dist --minify

# Bundle for browser
bun build ./index.ts --target browser --outdir ./dist
```

### Bundle Configuration

```typescript
// Build script
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'bun',
  splitting: true,
});
```

## Environment Variables

### Loading .env

**Automatic .env loading:**
```typescript
// .env
DATABASE_URL=postgresql://...
API_KEY=secret-key

// index.ts
console.log(process.env.DATABASE_URL); // Automatically loaded
```

**Or explicitly:**
```typescript
import { config } from 'dotenv';
config();

console.log(process.env.API_KEY);
```

## Package.json Scripts

### Common Scripts

```json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "build": "bun build ./src/index.ts --outdir ./dist",
    "start": "bun run dist/index.js",
    "test": "bun test",
    "test:watch": "bun test --watch"
  }
}
```

## Performance Tips

### Fast Startup

**Bun's fast startup:**
- No compilation step for TypeScript
- Native module resolution
- Fast package loading

### Hot Reload

```bash
# Watch mode
bun --watch index.ts

# Or in package.json
"dev": "bun --watch index.ts"
```

## Migration from Node.js

### Compatibility

**Most Node.js code works:**
- npm packages work
- Common APIs supported
- File system APIs compatible
- Process APIs similar

### Differences

**Some differences:**
- Different module resolution
- Some Node.js APIs not implemented
- Different error messages
- Performance characteristics

### Migration Steps

1. Install Bun
2. Replace `node` with `bun` in scripts
3. Test application
4. Update any incompatible code
5. Take advantage of Bun features

## Common Use Cases

### API Server

```typescript
const server = Bun.serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/users') {
      return Response.json({ users: [] });
    }
    
    return new Response("Not found", { status: 404 });
  },
});
```

### CLI Tool

```typescript
// cli.ts
const args = process.argv.slice(2);
console.log('Arguments:', args);

// Run: bun cli.ts arg1 arg2
```

### Script Runner

```typescript
// script.ts
import { $ } from 'bun';

// Run shell commands
await $`echo "Hello from Bun"`;
await $`git status`;
```

## Best Practices

1. **Use TypeScript:** Built-in support, no compilation needed
2. **Leverage speed:** Use Bun's fast package manager
3. **Native APIs:** Use built-in fetch, file system, etc.
4. **Testing:** Use built-in test runner
5. **Bundling:** Use Bun's bundler for production builds

## Conclusion

Bun provides:
- **Fast performance:** 3-4x faster than Node.js
- **All-in-one:** Runtime, bundler, test runner, package manager
- **TypeScript support:** Built-in, no compilation
- **Node.js compatible:** Most code works without changes
- **Better DX:** Fast, simple, modern

**Getting started:**
1. Install Bun
2. Create a project
3. Write TypeScript/JavaScript
4. Run with `bun run`
5. Enjoy the speed!

Remember: Bun is still evolving. Check compatibility for your specific use
cases and take advantage of its performance benefits.
