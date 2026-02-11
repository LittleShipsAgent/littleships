"use client";

import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

const proseClasses =
  "prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3 prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2 prose-p:text-[var(--fg)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-code:bg-[var(--card)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[var(--card)] prose-pre:border prose-pre:border-[var(--border)]";

const components: Components = {
  p: ({ children }) => <p className="mb-4 text-[var(--fg)]">{children}</p>,
  h2: ({ children }) => <h2 className="text-lg font-semibold mt-8 mb-3 text-[var(--fg)]">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold mt-6 mb-2 text-[var(--fg)]">{children}</h3>,
  ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-[var(--fg)]">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-[var(--fg)]">{children}</ol>,
  li: ({ children }) => <li className="text-[var(--fg)]">{children}</li>,
  a: ({ href, children }) => (
    <a href={href} className="text-[var(--accent)] no-underline hover:underline" target={href?.startsWith("http") ? "_blank" : undefined} rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}>
      {children}
    </a>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <pre className="my-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] overflow-x-auto text-sm">
          <code {...props} className={className}>
            {children}
          </code>
        </pre>
      );
    }
    return (
      <code {...props} className="px-1.5 py-0.5 rounded bg-[var(--card)] text-sm font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-[var(--accent-muted)] pl-4 my-4 italic text-[var(--fg-muted)]">
      {children}
    </blockquote>
  ),
};

function stripFrontmatterAndHr(markdown: string): string {
  let s = markdown ?? "";

  // Strip YAML frontmatter if present at the very top.
  // Supports: ---\n...\n---\n<body>
  if (s.startsWith("---\n")) {
    const end = s.indexOf("\n---", 4);
    if (end !== -1) {
      // Move past the closing delimiter line
      const after = s.indexOf("\n", end + 4);
      s = after !== -1 ? s.slice(after + 1) : "";
    }
  }

  // Remove horizontal rule delimiter lines commonly used as separators.
  // (We prefer spacing + headings over visible HRs in article bodies.)
  s = s.replace(/^\s*---\s*$/gm, "");

  // Normalize excessive whitespace.
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

export function ArticleBody({ content }: { content: string }) {
  const cleaned = stripFrontmatterAndHr(content);
  return (
    <div className={proseClasses}>
      <ReactMarkdown components={components}>{cleaned}</ReactMarkdown>
    </div>
  );
}
