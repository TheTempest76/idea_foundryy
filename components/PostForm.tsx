"use client";

import { useEffect, useMemo } from "react";
import { useFormStatus } from "react-dom";
import MarkdownEditor from "./MarkdownEditor";
import { usePostFormStore } from "../src/stores/usePostFormStore"; // <-- your zustand store

type FormAction = (formData: FormData) => void | Promise<any>;
type Props =
  | { action: FormAction; defaultAuthorUsername?: string }
  | { onSubmit: FormAction; defaultAuthorUsername?: string };

export default function PostForm(p: Props) {
  // Support both props; prefer `action`
  const action: FormAction = "action" in p ? p.action : p.onSubmit;
  if (!action) throw new Error("PostForm needs a Server Action via `action`.");
  const defaultAuthorUsername = p.defaultAuthorUsername ?? "guest";

  const {
    title, slug, category, content, authorUsername,
    setTitle, setSlug, touchSlug, setCategory, setContent, setAuthorUsername,
  } = usePostFormStore();

  useEffect(() => {
    if (authorUsername !== defaultAuthorUsername) setAuthorUsername(defaultAuthorUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultAuthorUsername]);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && content.trim().length > 0,
    [title, content]
  );

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-2">
        <label className="text-sm font-medium">Title</label>
        <input
          name="title"
          className="border rounded-md px-3 py-2 bg-background"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Slug</label>
        <input
          name="slug"
          className="border rounded-md px-3 py-2 bg-background"
          placeholder="post-slug"
          value={slug}
          onChange={(e) => { touchSlug(); setSlug(e.target.value); }}
        />
        <p className="text-xs text-muted-foreground">URL: <code>/blog/{slug || "…"}</code></p>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Category</label>
        <input
          name="category"
          className="border rounded-md px-3 py-2 bg-background"
          placeholder="e.g., dev, engineering, product"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Author Username</label>
        <input
          name="authorUsername"
          className="border rounded-md px-3 py-2 bg-background"
          value={authorUsername}
          onChange={(e) => setAuthorUsername(e.target.value)}
          placeholder="guest"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Content (Markdown)</label>
        <MarkdownEditor value={content} onChange={setContent} />
        <input type="hidden" name="content" value={content} />
      </div>

      <SubmitButton disabled={!canSubmit} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Publishing…" : "Publish"}
    </button>
  );
}
