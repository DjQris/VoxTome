"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function AppError({
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
        ⚠️
      </span>
      <h2 className="font-heading text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        We hit an unexpected error. Try again, or return to your library.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/library")}>
          Go to library
        </Button>
      </div>
    </div>
  )
}