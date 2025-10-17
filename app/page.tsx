import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Zap, Users, BarChart3, Sparkles } from "lucide-react"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />

        {/* Features */}
        <section aria-labelledby="features-title" className="border-t py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <header className="mb-12">
              <h2 id="features-title" className="text-pretty text-3xl font-bold tracking-tight md:text-4xl">
                Built for creators and teams
              </h2>
              <p className="mt-3 text-lg text-muted-foreground">
                Everything you need to draft, collaborate, and publish at scale.
              </p>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="flex flex-col gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Clearly Defined Categories</h3>
                <p className="text-sm text-muted-foreground">
                  Organize content by topics and interests to easily discover relevant ideas.
                </p>
                </Card>
                <Card className="flex flex-col gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-5 w-5 text-accent" />
                </div>
                <h3 className="text-lg font-semibold">Find Like-Minded Creators</h3>
                <p className="text-sm text-muted-foreground">
                  Connect and collaborate with others who share your passions and goals.
                </p>
              </Card>
              <Card className="flex flex-col gap-4 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Analytics & Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Understand what resonates and grow your audience intelligently.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section aria-labelledby="cta-title" className="border-t py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4">
            <Card className="relative overflow-hidden p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" aria-hidden="true" />
              <div className="relative z-10">
                <div className="flex items-start gap-3">
                  <Zap className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h2 id="cta-title" className="text-pretty text-3xl font-bold md:text-4xl">
                      Start shaping ideas today
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">
                      Join ideafoundry and turn drafts into published insights—together.
                    </p>
                    <div className="mt-6">
                      <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/dashboard">Enter Your Dashboard</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t py-10">
        <div className="container mx-auto max-w-6xl px-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ideafoundry. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
