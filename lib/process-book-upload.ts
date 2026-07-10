import { extractText } from "@/lib/parsers"
import { prisma } from "@/lib/prisma"
import { deleteStoredPrefix, readStoredFile } from "@/lib/storage"

const CHUNK_BATCH_SIZE = 100

type ProcessBookUploadInput = {
  bookId: string
  storagePath: string
  fileName: string
  userId: string
  defaultAccent: "BRITISH" | "AMERICAN" | "NIGERIAN"
  defaultSpeed: number
}

export async function processBookUpload({
  bookId,
  storagePath,
  fileName,
  userId,
  defaultAccent,
  defaultSpeed,
}: ProcessBookUploadInput) {
  const buffer = await readStoredFile(storagePath)
  const { fileType, chunks } = await extractText(fileName, buffer)

  if (chunks.length === 0) {
    throw new Error("Could not extract readable text from this file.")
  }

  const title = fileName.replace(/\.[^.]+$/, "")

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title,
      fileName,
      fileType,
      totalChunks: chunks.length,
    },
  })

  for (let index = 0; index < chunks.length; index += CHUNK_BATCH_SIZE) {
    const batch = chunks.slice(index, index + CHUNK_BATCH_SIZE)

    await prisma.textChunk.createMany({
      data: batch.map((content, offset) => ({
        bookId,
        index: index + offset,
        content,
      })),
    })
  }

  await prisma.readingProgress.upsert({
    where: { bookId },
    create: {
      userId,
      bookId,
      chunkIndex: 0,
      positionMs: 0,
      accent: defaultAccent,
      speed: defaultSpeed,
    },
    update: {},
  })
}

export async function cleanupFailedUpload({
  bookId,
  storagePath,
}: {
  bookId: string
  storagePath: string
}) {
  await prisma.book.delete({ where: { id: bookId } }).catch(() => undefined)
  await deleteStoredPrefix(storagePath.split("/").slice(0, -1).join("/")).catch(
    () => undefined
  )
}