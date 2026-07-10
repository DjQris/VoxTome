import { redirect } from "next/navigation"

import { ReaderShell } from "@/components/reader/reader-shell"
import { getSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { ReaderBook } from "@/lib/types"
import { toAccent } from "@/lib/types"

const CHUNK_WINDOW = 15

type ReaderPageProps = {
  params: Promise<{ bookId: string }>
}

export default async function ReaderPage({ params }: ReaderPageProps) {
  const user = await getSessionUser()
  const { bookId } = await params

  if (!user) {
    redirect("/welcome")
  }

  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      userId: user.id,
    },
    include: {
      progress: true,
    },
  })

  if (!book) {
    redirect("/library")
  }

  const startChunk = book.progress?.chunkIndex ?? 0
  const from = Math.max(0, startChunk - CHUNK_WINDOW)
  const to =
    book.totalChunks > 0
      ? Math.min(book.totalChunks - 1, startChunk + CHUNK_WINDOW)
      : 0

  const chunks = await prisma.textChunk.findMany({
    where: {
      bookId,
      index: { gte: from, lte: to },
    },
    orderBy: { index: "asc" },
    select: {
      index: true,
      content: true,
    },
  })

  const payload: ReaderBook = {
    id: book.id,
    title: book.title,
    totalChunks: book.totalChunks,
    chunks,
    progress: book.progress
      ? {
          chunkIndex: book.progress.chunkIndex,
          positionMs: book.progress.positionMs,
          accent: toAccent(book.progress.accent),
          speed: book.progress.speed,
        }
      : null,
  }

  return <ReaderShell book={payload} />
}