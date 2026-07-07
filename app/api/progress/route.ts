import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Accent } from "@/lib/types"

type ProgressBody = {
  bookId?: string
  chunkIndex?: number
  positionMs?: number
  accent?: Accent
  speed?: number
}

async function upsertProgress(userId: string, body: ProgressBody) {
  const { bookId, chunkIndex, positionMs, accent, speed } = body

  if (!bookId || chunkIndex === undefined) {
    return NextResponse.json(
      { error: "bookId and chunkIndex are required" },
      { status: 400 }
    )
  }

  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      userId,
    },
  })

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }

  const progress = await prisma.readingProgress.upsert({
    where: { bookId },
    create: {
      userId,
      bookId,
      chunkIndex,
      positionMs: positionMs ?? 0,
      accent: accent ?? "AMERICAN",
      speed: speed ?? 1,
    },
    update: {
      chunkIndex,
      ...(positionMs !== undefined ? { positionMs } : {}),
      ...(accent ? { accent } : {}),
      ...(speed !== undefined ? { speed } : {}),
    },
  })

  return NextResponse.json({
    chunkIndex: progress.chunkIndex,
    positionMs: progress.positionMs,
    accent: progress.accent,
    speed: progress.speed,
    updatedAt: progress.updatedAt.toISOString(),
  })
}

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser()
    const bookId = new URL(request.url).searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json({ error: "bookId is required" }, { status: 400 })
    }

    const progress = await prisma.readingProgress.findFirst({
      where: {
        bookId,
        userId: user.id,
      },
    })

    if (!progress) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      chunkIndex: progress.chunkIndex,
      positionMs: progress.positionMs,
      accent: progress.accent,
      speed: progress.speed,
      updatedAt: progress.updatedAt.toISOString(),
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load progress"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = (await request.json()) as ProgressBody
    return upsertProgress(user.id, body)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save progress"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = (await request.json()) as ProgressBody
    return upsertProgress(user.id, body)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save progress"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}