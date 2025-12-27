export function treePathCompare(a: string, b: string): number {
  if (a === b) return 0;

  // `fast-glob` returns POSIX-style paths by default; normalize just in case.
  const aSegs = a.split("/").filter(Boolean);
  const bSegs = b.split("/").filter(Boolean);
  const cmp = (x: string, y: string) =>
    x.localeCompare(y, undefined, { sensitivity: "base" });

  const minLen = Math.min(aSegs.length, bSegs.length);
  for (let i = 0; i < minLen; i++) {
    const as = aSegs[i]!;
    const bs = bSegs[i]!;

    if (as === bs) continue;

    // At the first differing segment, we're comparing two siblings under the same parent.
    // Sort: files first, then folders; within each group, sort by name.
    const aIsFileHere = i === aSegs.length - 1;
    const bIsFileHere = i === bSegs.length - 1;
    if (aIsFileHere !== bIsFileHere) return aIsFileHere ? -1 : 1;

    return cmp(as, bs);
  }

  // One path is a prefix of the other (e.g. `docs.md` vs `docs/guide.md`).
  // Treat the shorter one as "file at this level" and sort it first.
  return aSegs.length - bSegs.length;
}
