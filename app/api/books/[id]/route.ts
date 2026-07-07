import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { deleteStoredPrefix } from "@/lib/storage"
import type { ReaderBook } from "@/lib/types"
import { toAccent } from "@/lib/types"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params

    const book = await prisma.book.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        chunks: {
          orderBy: { index: "asc" },
          select: {
            index: true,
            content: true,
          },
        },
        progress: true,
      },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const payload: ReaderBook = {
      id: book.id,
      title: book.title,
      totalChunks: book.totalChunks,
      chunks: book.chunks,
      progress: book.progress
        ? {
            chunkIndex: book.progress.chunkIndex,
            positionMs: book.progress.positionMs,
            accent: toAccent(book.progress.accent),
            speed: book.progress.speed,
          }
        : null,
    }

    return NextResponse.json(payload)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load book"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params

    const book = await prisma.book.findFirst({
      where: { id, userId: user.id },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    await prisma.book.delete({ where: { id } })

    await deleteStoredPrefix(`books/${user.id}/${id}`).catch(() => undefined)
    await deleteStoredPrefix(`audio/${id}`).catch(() => undefined)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to delete book"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}