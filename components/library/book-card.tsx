"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { TrashIcon } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/format"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type BookCardProps = {
  id: string
  title: string
  fileType: string
  totalChunks: number
  percent: number
  lastListenedAt: Date | null
}

export function BookCard({
  id,
  title,
  fileType,
  totalChunks,
  percent,
  lastListenedAt,
}: BookCardProps) {
  const router = useRouter()

  const deleteBook = async () => {
    if (!window.confirm(`Remove "${title}" from your library?`)) {
      return
    }

    try {
      const response = await fetch(`/api/books/${id}`, { method: "DELETE" })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? "Delete failed")
      }

      toast.success("Book removed")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed"
      toast.error(message)
    }
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="line-clamp-2">{title}</CardTitle>
            <CardDescription>
              {fileType.toUpperCase()} · {totalChunks} sections
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => void deleteBook()}
            aria-label={`Delete ${title}`}
          >
            <TrashIcon />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        {lastListenedAt ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Last listened {formatRelativeTime(lastListenedAt)}
          </p>
        ) : null}
      </CardContent>
      <CardFooter>
        <Link href={`/reader/${id}`} className="w-full">
          <Button variant="secondary" className="w-full">
            {percent > 0 ? "Resume" : "Start listening"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}