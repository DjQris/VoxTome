import { chunkText } from "@/lib/parsers/chunk-text"
import { parseDocx } from "@/lib/parsers/parse-docx"
import { parseEpub } from "@/lib/parsers/parse-epub"
import { parsePdf } from "@/lib/parsers/parse-pdf"

export type SupportedFileType = "pdf" | "docx" | "epub"

const EXTENSION_MAP: Record<string, SupportedFileType> = {
  pdf: "pdf",
  docx: "docx",
  epub: "epub",
}

export function getFileType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase()
  return extension ? EXTENSION_MAP[extension] : undefined
}

export async function extractText(fileName: string, buffer: Buffer) {
  const fileType = getFileType(fileName)

  if (!fileType) {
    throw new Error("Unsupported file type. Use PDF, DOCX, or EPUB.")
  }

  let text = ""

  switch (fileType) {
    case "pdf":
      text = await parsePdf(buffer)
      break
    case "docx":
      text = await parseDocx(buffer)
      break
    case "epub":
      text = await parseEpub(buffer)
      break
  }

  if (!text.trim()) {
    throw new Error("No readable text found in this file.")
  }

  return {
    fileType,
    text,
    chunks: chunkText(text),
  }
}