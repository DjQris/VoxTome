import { extractText, getDocumentProxy } from "unpdf"

export async function parsePdf(buffer: Buffer) {
  const pdf = await getDocumentProxy(new Uint8Array(buffer))
  const { text } = await extractText(pdf, { mergePages: true })
  return text.trim()
}