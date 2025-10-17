import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative">
      {/* Spacer for fixed navbar */}
      <div className="h-16 md:h-20" aria-hidden="true" />
      <div className="container mx-auto max-w-6xl px-4 py-14 md:py-24">
        <div className="flex flex-col gap-6">
          <div className="flex justify-start">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              <span role="img" aria-label="sparkles">✨</span> Open source & free to use
            </Badge>
          </div>

          <header className="max-w-3xl">
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Where ideas become <span className="text-accent">collective intelligence</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              ideafoundry is a multi-user blogging platform to draft, review, and publish together—fast, focused, and
              beautifully.
            </p>
          </header>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-primary hover:primary/90"
            >
              <Link href="/create" className="gap-2">
                Start writing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Link href="/blog">Explore posts</Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">Trusted by teams and independent creators building in public.</p>
        </div>
      </div>
    </section>
  )
}
