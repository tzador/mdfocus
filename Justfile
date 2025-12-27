dev root: _version
  bunx concurrently \
    "bun run --hot backend/src/backend.ts --port 4141 {{root}}" \
    "cd frontend && bun run dev"

build: _version
  rm -rf backend/dist
  cd backend && bun build src/backend.ts --outdir dist --target node --format esm
  cd frontend && bun run build

publish: build
  cd backend && cp package.json package.json.bak
  cp README.md backend/README.md
  cd backend && bun run scripts/prepublish.ts
  cd backend && bun publish --access public
  cd backend && cp package.json.bak package.json
  rm backend/package.json.bak
  rm backend/README.md

_version:
  cd backend && bun run scripts/version.ts
