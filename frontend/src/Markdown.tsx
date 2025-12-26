import ReactMarkdown from "react-markdown";
import { NavLink } from "react-router";
// import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

export function Markdown({ markdown }: { markdown: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        // rehypePlugins={[rehypeHighlight]}
        components={{
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
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
