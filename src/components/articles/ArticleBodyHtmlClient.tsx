"use client";

import { useEffect, useRef } from "react";

export function ArticleBodyHtmlClient({
  className,
  html,
}: {
  className: string;
  html: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.("button[data-code-copy]") as HTMLButtonElement | null;
      if (!btn) return;

      const codeId = btn.getAttribute("data-code-copy");
      if (!codeId) return;

      const module = btn.closest?.("[data-code-module]") as HTMLElement | null;
      const codeEl = module?.querySelector?.(`code[data-code-id="${codeId}"]`) as HTMLElement | null;
      const text = codeEl?.textContent ?? "";
      if (!text) return;

      void navigator.clipboard.writeText(text);

      // Lightweight feedback.
      const prev = btn.textContent;
      btn.textContent = "Copied";
      window.setTimeout(() => {
        btn.textContent = prev;
      }, 1200);
    }

    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("click", onClick);
    };
  }, []);

  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
