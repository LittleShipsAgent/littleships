"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export function MarkdownEditor({ value, onChange, height = 520 }: { value: string; onChange: (v: string) => void; height?: number }) {
  // Keep the options stable across renders
  const previewOptions = useMemo(() => ({ rehypePlugins: [] as any[] }), []);

  return (
    <div data-color-mode="dark">
      {/* uiw types are a bit loose with React 19 */}
      {/* @ts-ignore */}
      <MDEditor value={value} onChange={(v: any) => onChange(String(v ?? ""))} height={height} previewOptions={previewOptions} />
    </div>
  );
}
