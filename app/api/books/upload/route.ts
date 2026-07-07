import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { extractText } from "@/lib/parsers"
import { prisma } from "@/lib/prisma"
import { saveFile } from "@/lib/storage"

export const maxDuration = 60

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 50 MB." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const { fileType, chunks } = await extractText(file.name, buffer)

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Could not extract readable text from this file." },
        { status: 400 }
      )
    }

    const bookId = crypto.randomUUID()
    const storagePath = `books/${user.id}/${bookId}/${file.name}`

    await saveFile(storagePath, buffer)

    const title = file.name.replace(/\.[^.]+$/, "")

    const book = await prisma.book.create({
      data: {
        id: bookId,
        userId: user.id,
        title,
        fileName: file.name,
        fileType,
        storagePath,
        totalChunks: chunks.length,
        chunks: {
          create: chunks.map((content, index) => ({
            index,
            content,
          })),
        },
        progress: {
          create: {
            userId: user.id,
            chunkIndex: 0,
            positionMs: 0,
            accent: (user.preferences?.defaultAccent ?? "AMERICAN") as
              | "BRITISH"
              | "AMERICAN"
              | "NIGERIAN",
            speed: user.preferences?.defaultSpeed ?? 1,
          },
        },
      },
      select: {
        id: true,
        title: true,
        totalChunks: true,
      },
    })

    return NextResponse.json(book)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to upload book"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}