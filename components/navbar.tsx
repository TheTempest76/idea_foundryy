"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-transparent",
      )}
      role="banner"
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4" aria-label="Primary">
        <div className="flex items-center gap-3">
          <Link href="/" className="inline-flex items-center font-medium">
            <span className="sr-only">ideafoundry home</span>
            <span className="text-lg font-bold tracking-tight text-primary">ideafoundry</span>
          </Link>
          <span className="hidden h-5 w-px bg-border md:inline-block" aria-hidden="true" />
          <ul className="hidden items-center gap-6 md:flex">
            <li>
              <Link href="/blog" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Explore
              </Link>
            </li>
            <li>
              <Link href="/create" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Create
              </Link>
            </li>
            <li>
              <Link href="/chat" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Chat
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="#">Get started</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
