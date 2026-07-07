import type { Accent } from "@/lib/types"

const QUEUE_KEY = "voxtome-progress-queue"

export type QueuedProgress = {
  bookId: string
  chunkIndex: number
  positionMs: number
  accent: Accent
  speed: number
  queuedAt: number
}

function readQueue(): QueuedProgress[] {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY)
    if (!raw) {
      return []
    }

    return JSON.parse(raw) as QueuedProgress[]
  } catch {
    return []
  }
}

function writeQueue(queue: QueuedProgress[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function queueProgress(entry: Omit<QueuedProgress, "queuedAt">) {
  const queue = readQueue().filter((item) => item.bookId !== entry.bookId)
  queue.push({ ...entry, queuedAt: Date.now() })
  writeQueue(queue)
}

export function getQueuedProgress(bookId: string) {
  return readQueue().find((item) => item.bookId === bookId)
}

export async function saveProgressWithQueue(
  payload: Omit<QueuedProgress, "queuedAt">
) {
  queueProgress(payload)

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { queued: true as const }
  }

  try {
    const response = await fetch("/api/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      return { queued: true as const }
    }

    const queue = readQueue().filter((item) => item.bookId !== payload.bookId)
    writeQueue(queue)

    return { queued: false as const }
  } catch {
    return { queued: true as const }
  }
}

export function saveProgressBeacon(
  payload: Omit<QueuedProgress, "queuedAt">
) {
  queueProgress(payload)

  if (typeof navigator === "undefined" || !navigator.sendBeacon) {
    return
  }

  const body = JSON.stringify(payload)
  const blob = new Blob([body], { type: "application/json" })
  navigator.sendBeacon("/api/progress", blob)
}

export async function flushProgressQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return
  }

  const queue = readQueue()

  if (queue.length === 0) {
    return
  }

  const remaining: QueuedProgress[] = []

  for (const item of queue) {
    try {
      const response = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: item.bookId,
          chunkIndex: item.chunkIndex,
          positionMs: item.positionMs,
          accent: item.accent,
          speed: item.speed,
        }),
      })

      if (!response.ok) {
        remaining.push(item)
      }
    } catch {
      remaining.push(item)
    }
  }

  writeQueue(remaining)
}