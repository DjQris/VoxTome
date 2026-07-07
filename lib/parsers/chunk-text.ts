const CHUNK_TARGET = 500

function splitIntoSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

export function chunkText(text: string, targetSize = CHUNK_TARGET) {
  const sentences = splitIntoSentences(text)
  const chunks: string[] = []
  let current = ""

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}` : sentence

    if (next.length > targetSize && current) {
      chunks.push(current)
      current = sentence
    } else {
      current = next
    }
  }

  if (current) {
    chunks.push(current)
  }

  if (chunks.length === 0 && text.trim()) {
    chunks.push(text.trim())
  }

  return chunks
}