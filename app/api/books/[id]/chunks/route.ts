import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params
    const url = new URL(request.url)
    const from = Number(url.searchParams.get("from") ?? 0)
    const to = Number(url.searchParams.get("to") ?? from + 20)

    if (!Number.isFinite(from) || !Number.isFinite(to) || from < 0 || to < from) {
      return NextResponse.json({ error: "Invalid range" }, { status: 400 })
    }

    const book = await prisma.book.findFirst({
      where: { id, userId: user.id },
      select: { id: true, totalChunks: true },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const cappedTo = Math.min(to, book.totalChunks - 1)

    const chunks = await prisma.textChunk.findMany({
      where: {
        bookId: id,
        index: { gte: from, lte: cappedTo },
      },
      orderBy: { index: "asc" },
      select: { index: true, content: true },
    })

    return NextResponse.json({ chunks, totalChunks: book.totalChunks })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load chunks"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}