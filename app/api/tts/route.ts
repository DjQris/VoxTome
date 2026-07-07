import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Accent } from "@/lib/types"
import { getAudioUrl, saveFile, storedFileExists } from "@/lib/storage"
import { synthesizeSpeech } from "@/lib/tts/synthesize"
import { getAudioCachePath } from "@/lib/tts/voices"

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = (await request.json()) as {
      bookId?: string
      chunkIndex?: number
      accent?: Accent
    }

    const { bookId, chunkIndex, accent } = body

    if (!bookId || chunkIndex === undefined || !accent) {
      return NextResponse.json(
        { error: "bookId, chunkIndex, and accent are required" },
        { status: 400 }
      )
    }

    const book = await prisma.book.findFirst({
      where: {
        id: bookId,
        userId: user.id,
      },
      include: {
        chunks: {
          orderBy: { index: "asc" },
        },
      },
    })

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    const chunk = book.chunks.find((item) => item.index === chunkIndex)

    if (!chunk) {
      return NextResponse.json({ error: "Chunk not found" }, { status: 404 })
    }

    const cachePath = getAudioCachePath(bookId, chunkIndex, accent)

    if (!(await storedFileExists(cachePath))) {
      const previousText = book.chunks.find(
        (item) => item.index === chunkIndex - 1
      )?.content
      const nextText = book.chunks.find(
        (item) => item.index === chunkIndex + 1
      )?.content

      const audio = await synthesizeSpeech({
        text: chunk.content,
        accent,
        previousText,
        nextText,
      })

      await saveFile(cachePath, audio)
    }

    return NextResponse.json({
      url: await getAudioUrl(cachePath),
      cached: true,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to synthesize speech"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}