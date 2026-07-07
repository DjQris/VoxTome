import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { readStoredFile } from "@/lib/storage"

export async function GET(request: Request) {
  try {
    await requireSessionUser()

    const path = new URL(request.url).searchParams.get("path")

    if (!path || path.includes("..")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const audio = await readStoredFile(path)

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Audio not found"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 404 })
  }
}