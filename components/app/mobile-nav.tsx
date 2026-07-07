"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BooksIcon,
  GearIcon,
  PlusCircleIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/library", label: "Library", icon: BooksIcon },
  { href: "/upload", label: "Upload", icon: PlusCircleIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
] as const

export function MobileNav() {
  const pathname = usePathname()

  if (pathname.startsWith("/reader/")) {
    return null
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-md sm:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-3 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="size-5" weight={isActive ? "fill" : "regular"} />
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}