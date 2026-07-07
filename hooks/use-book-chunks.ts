"use client"

import * as React from "react"

import type { ReaderChunk } from "@/lib/types"

const PREFETCH_MARGIN = 5
const FETCH_RADIUS = 15

function mergeChunks(existing: ReaderChunk[], incoming: ReaderChunk[]) {
  const map = new Map(existing.map((chunk) => [chunk.index, chunk]))

  for (const chunk of incoming) {
    map.set(chunk.index, chunk)
  }

  return Array.from(map.values()).sort((a, b) => a.index - b.index)
}

export function useBookChunks({
  bookId,
  totalChunks,
  initialChunks,
  initialActiveIndex,
}: {
  bookId: string
  totalChunks: number
  initialChunks: ReaderChunk[]
  initialActiveIndex: number
}) {
  const [chunks, setChunks] = React.useState(initialChunks)
  const [activeIndex, setActiveIndex] = React.useState(initialActiveIndex)
  const fetchingRef = React.useRef<Set<string>>(new Set())

  const fetchRange = React.useCallback(
    async (from: number, to: number) => {
      const key = `${from}-${to}`

      if (fetchingRef.current.has(key)) {
        return
      }

      fetchingRef.current.add(key)

      try {
        const response = await fetch(
          `/api/books/${bookId}/chunks?from=${from}&to=${to}`
        )

        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as { chunks: ReaderChunk[] }
        setChunks((current) => mergeChunks(current, payload.chunks))
      } finally {
        fetchingRef.current.delete(key)
      }
    },
    [bookId]
  )

  React.useEffect(() => {
    if (chunks.length === 0) {
      return
    }

    const minIndex = chunks[0]?.index ?? 0
    const maxIndex = chunks[chunks.length - 1]?.index ?? 0

    if (activeIndex - minIndex <= PREFETCH_MARGIN && minIndex > 0) {
      const from = Math.max(0, minIndex - FETCH_RADIUS)
      void fetchRange(from, minIndex - 1)
    }

    if (maxIndex - activeIndex <= PREFETCH_MARGIN && maxIndex < totalChunks - 1) {
      const to = Math.min(totalChunks - 1, maxIndex + FETCH_RADIUS)
      void fetchRange(maxIndex + 1, to)
    }
  }, [activeIndex, chunks, fetchRange, totalChunks])

  const getChunk = React.useCallback(
    (index: number) => chunks.find((chunk) => chunk.index === index),
    [chunks]
  )

  return { chunks, getChunk, syncActiveIndex: setActiveIndex }
}