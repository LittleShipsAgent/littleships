import sanitizeHtml from "sanitize-html";

import { ArticleBodyHtmlClient } from "./ArticleBodyHtmlClient";

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
  // Code / code-module rendering
  "div",
  "span",
  "pre",
  "code",
];

const allowedAttributes: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  // Allow basic wrapper + token spans for syntax highlighting / code modules.
  div: ["class", "data-code-module"],
  span: ["class"],
  button: ["class", "type", "data-code-copy"],
  code: ["class", "data-code-id"],
  pre: ["class", "data-code-id"],
};

function labelFromCodeClass(codeClass: string | undefined): string {
  const m = (codeClass ?? "").match(/language-([a-z0-9_-]+)/i);
  if (!m) return "CODE";
  return m[1].replace(/[_-]+/g, " ").toUpperCase();
}

function wrapPreCodeBlocks(html: string): string {
  const s = html ?? "";

  // Turn: <pre><code class="language-bash">...</code></pre>
  // Into a docs-style module card.
  // Notes:
  // - We rely on sanitize-html afterwards for safety.
  // - We keep the original <code> class for potential syntax highlighting.
  return s.replace(
    /<pre(\s[^>]*)?>\s*<code(\s[^>]*)?>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_full, _preAttrs = "", codeAttrs = "", codeInner = "") => {
      const classMatch = String(codeAttrs).match(/class=("|')([^"']+)(\1)/i);
      const codeClass = classMatch?.[2];
      const label = labelFromCodeClass(codeClass);
      const copyId = `cm-${Math.random().toString(36).slice(2, 10)}`;

      return (
        `<div class="not-prose my-6 rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden" data-code-module="1">` +
        `<div class="flex items-center justify-between border-b border-[var(--border)] bg-[var(--card-hover)]">` +
        `<span class="px-3 py-2 text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider">${label}</span>` +
        `<button type="button" data-code-copy="${copyId}" class="mr-2 px-2 py-1 rounded border border-[var(--border)] bg-[var(--card)] text-xs font-medium text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--card-hover)] transition">Copy</button>` +
        `</div>` +
        `<pre data-code-id="${copyId}" class="m-0 p-4 text-sm text-[var(--fg-muted)] overflow-x-auto font-mono whitespace-pre bg-transparent border-0"><code data-code-id="${copyId}"${codeAttrs}>${codeInner}</code></pre>` +
        `</div>`
      );
    }
  );
}

function clean(html: string): string {
  const withModules = wrapPreCodeBlocks(html ?? "");

  return sanitizeHtml(withModules, {
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
  "article-body prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:text-[var(--fg)] prose-a:text-[var(--accent)] prose-a:no-underline hover:prose-a:underline prose-code:bg-[var(--card)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:border prose-code:border-[var(--border)] prose-pre:bg-[var(--card)] prose-pre:border prose-pre:border-[var(--border)] prose-pre:rounded-2xl prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:text-sm prose-pre:leading-relaxed";

export function ArticleBodyHtml({ html }: { html: string }) {
  const safe = clean(html);
  return <ArticleBodyHtmlClient className={proseClasses} html={safe} />;
}
