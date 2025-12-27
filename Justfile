dev root: _version
  bunx concurrently \
    "bun run --hot mdream/src/mdream.ts --port 4141 {{root}}" \
    "cd frontend && bun run dev"

build: _version
  rm -rf mdream/dist
  cd mdream && bun build src/mdream.ts --outdir dist --target node --format esm
  cd frontend && bun run build

_version:
  cd mdream && bun run scripts/version.ts
