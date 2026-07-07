import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { BookSummary } from "@/lib/types"
import { toAccent } from "@/lib/types"

export async function GET() {
  try {
    const user = await requireSessionUser()

    const books = await prisma.book.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        progress: true,
      },
    })

    const payload: BookSummary[] = books.map((book) => ({
      id: book.id,
      title: book.title,
      fileName: book.fileName,
      fileType: book.fileType,
      totalChunks: book.totalChunks,
      createdAt: book.createdAt.toISOString(),
      progress: book.progress
        ? {
            chunkIndex: book.progress.chunkIndex,
            positionMs: book.progress.positionMs,
            accent: toAccent(book.progress.accent),
            speed: book.progress.speed,
            percent:
              book.totalChunks > 0
                ? Math.round(
                    ((book.progress.chunkIndex + 1) / book.totalChunks) * 100
                  )
                : 0,
          }
        : null,
    }))

    return NextResponse.json(payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load books"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}