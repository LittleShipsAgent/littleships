"use client";

import { useEffect, useMemo, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";

function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function normalizeHtml(html: string): string {
  // TipTap expects a document; empty string can behave oddly.
  const h = (html ?? "").trim();
  return h.length === 0 ? "<p></p>" : h;
}

export function RichTextEditor({
  value,
  onChange,
  height = 560,
}: {
  value: string;
  onChange: (html: string) => void;
  height?: number;
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Placeholder.configure({ placeholder: "Write…" }),
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: normalizeHtml(value),
    // TipTap warns when it suspects SSR/hydration mismatches. In Next.js (even in client components),
    // explicitly disable immediate render to keep hydration stable.
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none prose-headings:font-semibold prose-a:text-[var(--accent)]",
      },
    },
    onUpdate: ({ editor }) => {
      if (mode === "visual") onChange(editor.getHTML());
    },
  });

  // Keep editor in sync when switching from HTML mode edits.
  useEffect(() => {
    if (!editor) return;
    if (mode !== "visual") return;

    const current = editor.getHTML();
    const next = normalizeHtml(value);
    if (current !== next) editor.commands.setContent(next, { emitUpdate: false });
  }, [value, editor, mode]);

  const can = editor;

  return (
    <div className="rounded border border-neutral-800 bg-neutral-950">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-900 p-2">
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            className={cx(
              "rounded px-2 py-1 text-xs",
              mode === "visual" ? "bg-neutral-800 text-neutral-100" : "bg-neutral-950 text-neutral-400 hover:bg-neutral-900"
            )}
            onClick={() => setMode("visual")}
          >
            Visual
          </button>
          <button
            type="button"
            className={cx(
              "rounded px-2 py-1 text-xs",
              mode === "html" ? "bg-neutral-800 text-neutral-100" : "bg-neutral-950 text-neutral-400 hover:bg-neutral-900"
            )}
            onClick={() => setMode("html")}
          >
            HTML
          </button>
        </div>

        <div className="flex flex-wrap gap-1">
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleBold().run()}>
            Bold
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleItalic().run()}>
            Italic
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleBulletList().run()}>
            Bullets
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleOrderedList().run()}>
            Numbered
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleBlockquote().run()}>
            Quote
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleCode().run()}>
            Code
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleCodeBlock().run()}>
            Code block
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleHeading({ level: 2 }).run()}>
            H2
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().toggleHeading({ level: 3 }).run()}>
            H3
          </button>
          <button type="button" className="rounded bg-neutral-900 px-2 py-1 text-xs" onClick={() => can?.chain().focus().setHorizontalRule().run()}>
            HR
          </button>
        </div>
      </div>

      {mode === "html" ? (
        <textarea
          className="w-full resize-y bg-neutral-950 px-3 py-3 font-mono text-xs text-neutral-100 outline-none"
          style={{ minHeight: height }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="px-3 py-3" style={{ minHeight: height }}>
          <EditorContent editor={editor} />
        </div>
      )}
    </div>
  );
}
