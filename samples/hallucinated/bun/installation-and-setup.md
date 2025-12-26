# Bun: Installation and Setup

## Introduction

Proper installation and configuration of Bun ensures optimal performance and
developer experience. This guide covers installation methods, configuration
options, and environment setup.

## Installation Methods

### Official Installer (Recommended)

**macOS and Linux:**
```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# The installer adds Bun to PATH automatically
# Restart terminal or run: source ~/.bashrc
```

**Windows (PowerShell):**
```powershell
# Install Bun
powershell -c "irm bun.sh/install.ps1 | iex"
```

**Windows (Git Bash/WSL):**
```bash
curl -fsSL https://bun.sh/install | bash
```

### Using npm

```bash
# Install globally with npm
npm install -g bun

# Or with yarn
yarn global add bun

# Or with pnpm
pnpm add -g bun
```

### Using Homebrew (macOS)

```bash
# Add Bun tap
brew tap oven-sh/bun

# Install Bun
brew install bun
```

### Manual Installation

```bash
# Download binary
curl -fsSL https://github.com/oven-sh/bun/releases/latest/download/bun-darwin-x64.zip -o bun.zip

# Extract
unzip bun.zip

# Move to PATH
sudo mv bun /usr/local/bin/
chmod +x /usr/local/bin/bun
```

## Verification

### Check Installation

```bash
# Check version
bun --version

# Check installation path
which bun

# Check Bun info
bun --help
```

### Verify Functionality

```bash
# Create test file
echo 'console.log("Bun works!")' > test.js

# Run test
bun test.js

# Should output: Bun works!
```

## Configuration

### Environment Variables

**BUN_INSTALL:**
```bash
# Set custom install directory
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

**BUN_DEBUG:**
```bash
# Enable debug logging
export BUN_DEBUG=1
```

### Shell Configuration

**Bash (~/.bashrc):**
```bash
# Add to ~/.bashrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

**Zsh (~/.zshrc):**
```zsh
# Add to ~/.zshrc
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"
```

**Fish (~/.config/fish/config.fish):**
```fish
# Add to config.fish
set -gx BUN_INSTALL $HOME/.bun
set -gx PATH $BUN_INSTALL/bin $PATH
```

## Project Setup

### Initialize New Project

```bash
# Create new directory
mkdir my-project
cd my-project

# Initialize Bun project
bun init

# Creates:
# - package.json
# - index.ts (or .js)
# - tsconfig.json (if TypeScript)
# - README.md
```

### Package.json Configuration

```json
{
  "name": "my-project",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "start": "bun run src/index.ts",
    "build": "bun build ./src/index.ts --outdir ./dist",
    "test": "bun test"
  },
  "devDependencies": {},
  "dependencies": {}
}
```

### TypeScript Configuration

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## IDE Configuration

### VS Code

**Settings (settings.json):**
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.associations": {
    "*.ts": "typescript"
  }
}
```

**Extensions:**
- TypeScript and JavaScript Language Features
- ESLint
- Prettier

### JetBrains IDEs

**Settings:**
- File → Settings → Languages & Frameworks → TypeScript
- Set TypeScript to use Bun runtime
- Enable Bun file watcher

## Development Environment

### Hot Reload Setup

```json
// package.json
{
  "scripts": {
    "dev": "bun run --watch src/index.ts",
    "dev:server": "bun --watch src/server.ts"
  }
}
```

### Environment Variables

**.env file:**
```bash
# .env
DATABASE_URL=postgresql://localhost:5432/mydb
API_KEY=your-api-key
NODE_ENV=development
```

**Loading in code:**
```typescript
// Automatically loaded by Bun
console.log(process.env.DATABASE_URL);

// Or explicitly
import { config } from 'dotenv';
config();
```

### Workspace Setup

**Monorepo structure:**
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
  ],
  "scripts": {
    "dev": "bun run --filter '*' dev",
    "build": "bun run --filter '*' build"
  }
}
```

## Production Setup

### Build Configuration

```typescript
// build.ts
import { build } from 'bun';

await build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  minify: true,
  target: 'bun',
  splitting: true,
  sourcemap: 'external',
});
```

### Docker Setup

**Dockerfile:**
```dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN bun run build

# Run
CMD ["bun", "run", "dist/index.js"]
```

### CI/CD Setup

**GitHub Actions:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test
      - run: bun run build
```

## Troubleshooting

### Installation Issues

**PATH not set:**
```bash
# Check if Bun is in PATH
echo $PATH | grep bun

# Add manually if needed
export PATH="$HOME/.bun/bin:$PATH"
```

**Permission denied:**
```bash
# Fix permissions
chmod +x ~/.bun/bin/bun
```

**Version conflicts:**
```bash
# Uninstall old version
rm -rf ~/.bun

# Reinstall
curl -fsSL https://bun.sh/install | bash
```

### Configuration Issues

**TypeScript not working:**
```bash
# Check TypeScript installation
bun add -d typescript

# Verify tsconfig.json
bun run --bun src/index.ts
```

**Module resolution:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

## Best Practices

1. **Use official installer:** Most reliable method
2. **Set up PATH:** Ensure Bun is accessible
3. **Configure TypeScript:** For better DX
4. **Use workspaces:** For monorepos
5. **Set up CI/CD:** Automated testing
6. **Docker:** For consistent environments
7. **Environment variables:** Use .env files

## Conclusion

Proper Bun installation and setup:
- Use official installer
- Configure shell PATH
- Set up TypeScript
- Configure IDE
- Set up development environment
- Prepare for production

**Key takeaways:**
- Install via official method
- Configure environment properly
- Set up TypeScript for better DX
- Use workspaces for monorepos
- Prepare Docker for deployment

Remember: Proper setup ensures smooth development and deployment experience.
