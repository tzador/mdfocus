interface Heading {
  level: number;
  text: string;
  line: number;
}

function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split("\n");
  const headings: Heading[] = [];

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      headings.push({ level, text, line: i + 1 });
    }
  }

  return headings;
}

export function TableOfContents({ markdown }: { markdown: string }) {
  const headings = extractHeadings(markdown);

  if (headings.length <= 1) {
    return null;
  }

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <details className="mx-auto max-w-4xl mb-6 group">
      <summary className="cursor-pointer font-mono text-sm text-(--mdfocus-muted) hover:text-(--mdfocus-fg) transition-colors select-none list-none flex items-center gap-1.5">
        <span className="text-xs transition-transform group-open:rotate-90">
          ▶
        </span>
        Table of Contents
      </summary>
      <nav className="mt-3 pl-4 border-l-2 border-(--mdfocus-border)">
        <ul className="space-y-1">
          {headings.map((heading) => (
            <li
              key={heading.line}
              style={{ paddingLeft: `${(heading.level - minLevel) * 1}rem` }}
            >
              <button
                onClick={() => {
                  const element = document.getElementById(`${heading.line}`);
                  if (element) {
                    const offset = 28;
                    const top =
                      element.getBoundingClientRect().top +
                      window.scrollY -
                      offset;
                    window.scrollTo({ top });
                  }
                }}
                className="font-mono text-sm text-(--mdfocus-link) hover:text-(--mdfocus-link-hover) transition-colors"
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
