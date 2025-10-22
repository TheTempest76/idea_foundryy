// app/blog/new/page.tsx
import "server-only";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Link from "next/link";
import PostForm from "../../../components/PostForm";
import { createPost } from "../blog/actions"; // <-- NOTE: correct relative path
import { ArrowBigLeft } from "lucide-react";

export default function NewPostPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">New Post</h1>
        <Link href="/" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-accent">
          <ArrowBigLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <div className="mt-8">
        <PostForm action={createPost} defaultAuthorUsername="guest" />
      </div>
    </main>
  );
}
