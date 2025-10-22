"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type Props = {
  categories: string[];
  selected?: string | null;
  targetPath?: string; // default: "/blog"
  label?: string;      // default: "Filter by category"
};

export default function CategoryFilter({
  categories,
  selected = null,
  targetPath = "/blog",
  label = "Filter by category",
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Include an "All" pseudo-option at the top
  const options = useMemo(() => ["All", ...categories], [categories]);

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (value === "All") {
      params.delete("category");
    } else {
      params.set("category", value);
    }

    const qs = params.toString();
    router.push(qs ? `${targetPath}?${qs}` : targetPath);
  }

  const current = selected ?? (searchParams?.get("category") ?? "All");

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">{label}</label>
      <select
        className="border rounded-md px-2 py-1 bg-background text-sm"
        value={current || "All"}
        onChange={onChange}
      >
        {options.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
