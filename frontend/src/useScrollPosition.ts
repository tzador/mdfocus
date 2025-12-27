import { useEffect, useMemo, useRef } from "react";

function normalizeRelativePath(path: string) {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function scrollStorageKey(root: string, relativePath: string) {
  return `mdfocus-scroll:${root}:${normalizeRelativePath(relativePath)}`;
}

export function useScrollPosition(root: string, relativePath: string) {
  const key = useMemo(
    () => scrollStorageKey(root, relativePath),
    [root, relativePath]
  );

  const restoredForKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      try {
        localStorage.setItem(key, String(window.scrollY || 0));
      } catch {}
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [key]);

  useEffect(() => {
    if (restoredForKeyRef.current === key) return;
    restoredForKeyRef.current = key;

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(key);
    } catch {
      raw = null;
    }

    const y = raw == null ? null : Number.parseInt(raw, 10);
    if (!Number.isFinite(y as number)) return;

    requestAnimationFrame(() => window.scrollTo({ top: y as number, left: 0 }));
  }, [key]);
}
