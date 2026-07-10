import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { isSupabaseStorageConfigured } from "@/lib/env"
import { getFileType } from "@/lib/parsers/file-type"
import { createSignedUploadUrl } from "@/lib/storage"
import { MAX_UPLOAD_BYTES } from "@/lib/upload-constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type UploadUrlBody = {
  fileName?: string
  fileSize?: number
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = (await request.json()) as UploadUrlBody
    const fileName = body.fileName?.trim()
    const fileSize = body.fileSize

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 })
    }

    if (!getFileType(fileName)) {
      return NextResponse.json(
        { error: "Unsupported file type. Use PDF, DOCX, or EPUB." },
        { status: 400 }
      )
    }

    if (typeof fileSize !== "number" || fileSize <= 0) {
      return NextResponse.json({ error: "fileSize is required" }, { status: 400 })
    }

    if (fileSize > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 50 MB." },
        { status: 400 }
      )
    }

    if (!isSupabaseStorageConfigured()) {
      return NextResponse.json({ mode: "direct" })
    }

    const bookId = crypto.randomUUID()
    const storagePath = `books/${user.id}/${bookId}/${fileName}`
    const signedUpload = await createSignedUploadUrl(storagePath)

    return NextResponse.json({
      mode: "signed",
      bookId,
      storagePath: signedUpload.path,
      signedUrl: signedUpload.signedUrl,
      token: signedUpload.token,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to prepare upload"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}