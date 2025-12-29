dev root: _version
    bunx concurrently \
      "bun run --hot backend/src/backend.ts --port 4141 {{ root }}" \
      "cd frontend && bun run dev"

build: _version
    rm -rf backend/dist
    cd backend && bun build src/backend.ts --outdir dist --target node --format esm
    cd frontend && bun run build

publish: build
    rm -rf backend/publish
    mkdir backend/publish
    cp README.md backend/publish/README.md
    cd backend && bun run scripts/prepublish.ts
    cp -r backend/bin/ backend/publish/bin/
    cp -r backend/dist/ backend/publish/dist/
    cd backend/publish && bun publish --access public
    rm -rf backend/publish

_version:
    cd backend && bun run scripts/version.ts
