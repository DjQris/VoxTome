import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { extractText, getFileType } from "@/lib/parsers"
import { prisma } from "@/lib/prisma"
import { readStoredFile, saveFile } from "@/lib/storage"
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants"

export const maxDuration = 60

type SignedUploadBody = {
  bookId?: string
  storagePath?: string
  fileName?: string
}

async function createBookFromBuffer({
  user,
  bookId,
  storagePath,
  fileName,
  buffer,
}: {
  user: Awaited<ReturnType<typeof requireSessionUser>>
  bookId: string
  storagePath: string
  fileName: string
  buffer: Buffer
}) {
  const { fileType, chunks } = await extractText(fileName, buffer)

  if (chunks.length === 0) {
    throw new Error("Could not extract readable text from this file.")
  }

  const title = fileName.replace(/\.[^.]+$/, "")

  return prisma.book.create({
    data: {
      id: bookId,
      userId: user.id,
      title,
      fileName,
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
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const contentType = request.headers.get("content-type") ?? ""

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as SignedUploadBody
      const bookId = body.bookId?.trim()
      const storagePath = body.storagePath?.trim()
      const fileName = body.fileName?.trim()

      if (!bookId || !storagePath || !fileName) {
        return NextResponse.json(
          { error: "bookId, storagePath, and fileName are required" },
          { status: 400 }
        )
      }

      if (!getFileType(fileName)) {
        return NextResponse.json(
          { error: "Unsupported file type. Use PDF, DOCX, or EPUB." },
          { status: 400 }
        )
      }

      const expectedPrefix = `books/${user.id}/${bookId}/`
      if (!storagePath.startsWith(expectedPrefix)) {
        return NextResponse.json({ error: "Invalid storage path" }, { status: 403 })
      }

      const buffer = await readStoredFile(storagePath)
      const book = await createBookFromBuffer({
        user,
        bookId,
        storagePath,
        fileName,
        buffer,
      })

      return NextResponse.json(book)
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 50 MB." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const bookId = crypto.randomUUID()
    const storagePath = `books/${user.id}/${bookId}/${file.name}`

    await saveFile(storagePath, buffer)

    const book = await createBookFromBuffer({
      user,
      bookId,
      storagePath,
      fileName: file.name,
      buffer,
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