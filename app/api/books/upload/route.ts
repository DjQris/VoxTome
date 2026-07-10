import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { getFileType } from "@/lib/parsers/file-type"
import { prisma } from "@/lib/prisma"
import { saveFile, waitForStoredFile } from "@/lib/storage"
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

type SignedUploadBody = {
  bookId?: string
  storagePath?: string
  fileName?: string
}

function getAccent(user: Awaited<ReturnType<typeof requireSessionUser>>) {
  return (user.preferences?.defaultAccent ?? "AMERICAN") as
    | "BRITISH"
    | "AMERICAN"
    | "NIGERIAN"
}

async function createProcessingBook({
  bookId,
  storagePath,
  fileName,
  user,
}: {
  bookId: string
  storagePath: string
  fileName: string
  user: Awaited<ReturnType<typeof requireSessionUser>>
}) {
  const fileType = getFileType(fileName)

  if (!fileType) {
    throw new Error("Unsupported file type. Use PDF, DOCX, or EPUB.")
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
      totalChunks: 0,
    },
    select: {
      id: true,
      title: true,
      totalChunks: true,
    },
  })
}

async function finalizeUploadedBook({
  bookId,
  storagePath,
  fileName,
  user,
}: {
  bookId: string
  storagePath: string
  fileName: string
  user: Awaited<ReturnType<typeof requireSessionUser>>
}) {
  await createProcessingBook({
    bookId,
    storagePath,
    fileName,
    user,
  })

  const { processBookUpload } = await import("@/lib/process-book-upload")

  await processBookUpload({
    bookId,
    storagePath,
    fileName,
    userId: user.id,
    defaultAccent: getAccent(user),
    defaultSpeed: user.preferences?.defaultSpeed ?? 1,
  })

  return prisma.book.findUniqueOrThrow({
    where: { id: bookId },
    select: {
      id: true,
      title: true,
      totalChunks: true,
    },
  })
}

export async function POST(request: Request) {
  let createdBookId: string | null = null

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

      const fileReady = await waitForStoredFile(storagePath)
      if (!fileReady) {
        return NextResponse.json(
          {
            error:
              "Uploaded file was not found in storage. Please try uploading again.",
          },
          { status: 400 }
        )
      }

      createdBookId = bookId
      const book = await finalizeUploadedBook({
        bookId,
        storagePath,
        fileName,
        user,
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

    createdBookId = bookId
    const book = await finalizeUploadedBook({
      bookId,
      storagePath,
      fileName: file.name,
      user,
    })

    return NextResponse.json(book)
  } catch (error) {
    if (createdBookId) {
      await prisma.book.delete({ where: { id: createdBookId } }).catch(() => undefined)
    }

    const message =
      error instanceof Error ? error.message : "Failed to upload book"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}