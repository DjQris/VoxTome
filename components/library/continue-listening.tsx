import Link from "next/link"

import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/format"

type ContinueListeningProps = {
  bookId: string
  title: string
  percent: number
  lastListenedAt: Date
}

export function ContinueListening({
  bookId,
  title,
  percent,
  lastListenedAt,
}: ContinueListeningProps) {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            Continue listening
          </p>
          <h2 className="font-heading mt-1 line-clamp-2 text-xl font-semibold sm:text-2xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {percent}% complete · {formatRelativeTime(lastListenedAt)}
          </p>
          <div className="mt-3 h-1.5 max-w-xs overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <Link href={`/reader/${bookId}`} className="shrink-0">
          <Button size="lg" className="w-full sm:w-auto">
            Resume listening
          </Button>
        </Link>
      </div>
    </div>
  )
}