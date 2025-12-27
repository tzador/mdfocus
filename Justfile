dev root: _version
  bunx concurrently \
    "bun run --hot mdfocus/src/mdfocus.ts --port 4141 {{root}}" \
    "cd frontend && bun run dev"

build: _version
  rm -rf mdfocus/dist
  cd mdfocus && bun build src/mdfocus.ts --outdir dist --target node --format esm
  cd frontend && bun run build

_version:
  cd mdfocus && bun run scripts/version.ts
