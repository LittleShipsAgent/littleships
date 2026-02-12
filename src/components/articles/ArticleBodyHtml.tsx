import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "s",
  "a",
  "blockquote",
  "ul",
  "ol",
  "li",
  "hr",
  "h2",
  "h3",
  "h4",
  "pre",
  "code",
];

const allowedAttributes: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  code: ["class"],
  pre: ["class"],
};

function clean(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags,
    allowedAttributes,
    // Allow safe link protocols only.
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: (tagName: string, attribs: Record<string, string>) => {
        const href = attribs.href || "";
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return {
          tagName,
          attribs: {
            ...attribs,
            target: isExternal ? "_blank" : attribs.target,
            rel: isExternal ? "noopener noreferrer" : attribs.rel,
          },
        };
      },
    },
  });
}

const proseClasses =
  "prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-[var(--fg)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-code:bg-[var(--card)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-[var(--card)] prose-pre:border prose-pre:border-[var(--border)]";

export function ArticleBodyHtml({ html }: { html: string }) {
  const safe = clean(html);
  return <div className={proseClasses} dangerouslySetInnerHTML={{ __html: safe }} />;
}
