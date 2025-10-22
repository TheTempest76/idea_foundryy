// components/MarkdownEditor.tsx
"use client";

import dynamic from "next/dynamic";
// react-md-editor needs to run on the client (no SSR)
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// Required styles
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your post in Markdown…",
  height = 420,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  height?: number;
}) {
  return (
    // Optionally control theme via `data-color-mode`: "light" | "dark" | "auto"
    <div data-color-mode="auto" className="rounded-md border">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        height={height}
        preview="live"                 // live split preview (use "edit" for editor-only)
        textareaProps={{ placeholder }}
      />
    </div>
  );
}
