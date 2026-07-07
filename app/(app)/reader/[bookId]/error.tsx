"use client"

import { useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function ReaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
      <span className="text-4xl" role="img" aria-label="Error">
        📖
      </span>
      <h2 className="font-heading text-xl font-semibold">
        Couldn&apos;t open this book
      </h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Something went wrong loading the reader. Your progress is still saved.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/library">
          <Button variant="outline">Back to library</Button>
        </Link>
      </div>
    </div>
  )
}