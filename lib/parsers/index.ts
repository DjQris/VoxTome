import { chunkText } from "@/lib/parsers/chunk-text"
import { getFileType, type SupportedFileType } from "@/lib/parsers/file-type"
import { parseDocx } from "@/lib/parsers/parse-docx"
import { parseEpub } from "@/lib/parsers/parse-epub"
import { parsePdf } from "@/lib/parsers/parse-pdf"

export { getFileType, type SupportedFileType }

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