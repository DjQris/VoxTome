import Link from "next/link"

import { MobileNav } from "@/components/app/mobile-nav"
import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/upload", label: "Upload" },
  { href: "/settings", label: "Settings" },
] as const

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/library" className="font-heading shrink-0 text-lg font-semibold">
            VoxTome
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/welcome" })
            }}
          >
            <Button type="submit" variant="ghost" size="sm" className="shrink-0">
              Sign out
            </Button>
          </form>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 pb-24 sm:px-6 sm:pb-6">
        {children}
      </div>

      <MobileNav />
    </div>
  )
}