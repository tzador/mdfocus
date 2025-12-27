import mermaid from "mermaid";
import { useEffect, useId, useState } from "react";
import ReactMarkdown from "react-markdown";
import { NavLink } from "react-router";
import remarkGfm from "remark-gfm";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
});

function Mermaid({ chart }: { chart: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    mermaid
      .render(`mermaid-${id}`, chart)
      .then(({ svg }) => {
        if (!cancelled) setSvg(svg);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [id, chart]);

  if (error) {
    return (
      <pre className="text-red-400 bg-red-950/30 p-4 rounded-lg overflow-auto">
        <code>{error}</code>
      </pre>
    );
  }

  if (!svg) {
    return <div className="animate-pulse bg-zinc-800 h-32 rounded-lg" />;
  }

  return (
    <div
      className="mermaid-diagram flex justify-center my-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Markdown({ markdown }: { markdown: string }) {
  const createHeading = (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") => {
    return ({
      node,
      children,
    }: {
      node?: { position?: { start: { line: number } } };
      children?: React.ReactNode;
    }) => {
      const id = String(node?.position?.start.line ?? "");
      return (
        <Tag id={id}>
          {id} # {children}
        </Tag>
      );
    };
  };

  return (
    <div className="mdream-prose prose prose-lg mx-auto max-w-4xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: createHeading("h1"),
          h2: createHeading("h2"),
          h3: createHeading("h3"),
          h4: createHeading("h4"),
          h5: createHeading("h5"),
          h6: createHeading("h6"),
          a({ href, children }) {
            if (!href) return;

            const url = new URL(href, window.location.href);

            if (
              url.origin === window.location.origin &&
              (href.endsWith(".md") || href.endsWith(".mdx"))
            ) {
              return <NavLink to={url.pathname}>{children}</NavLink>;
            }

            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match?.[1];

            if (lang === "mermaid") {
              return <Mermaid chart={String(children).trim()} />;
            }

            return <code className={className}>{children}</code>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
