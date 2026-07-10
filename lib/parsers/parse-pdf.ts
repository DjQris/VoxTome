import { createRequire } from "node:module"

type PdfParser = (buffer: Buffer) => Promise<{ text: string }>

let pdfParser: PdfParser | null = null

function getPdfParser() {
  if (!pdfParser) {
    const require = createRequire(import.meta.url)
    pdfParser = require("pdf-parse") as PdfParser
  }

  return pdfParser
}

export async function parsePdf(buffer: Buffer) {
  const result = await getPdfParser()(buffer)
  return result.text.trim()
}