import mammoth from "mammoth"

export async function parseDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer })
  return result.value.trim()
}