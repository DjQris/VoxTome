import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const pdf = require("pdf-parse") as (buffer: Buffer) => Promise<{ text: string }>

export async function parsePdf(buffer: Buffer) {
  const result = await pdf(buffer)
  return result.text.trim()
}