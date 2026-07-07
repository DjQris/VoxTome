export type Accent = "BRITISH" | "AMERICAN" | "NIGERIAN"

export function toAccent(value: string): Accent {
  if (value === "BRITISH" || value === "AMERICAN" || value === "NIGERIAN") {
    return value
  }

  return "AMERICAN"
}

export const ACCENTS: { value: Accent; label: string; flag: string }[] = [
  { value: "BRITISH", label: "British English", flag: "🇬🇧" },
  { value: "AMERICAN", label: "American English", flag: "🇺🇸" },
  { value: "NIGERIAN", label: "Nigerian English", flag: "🇳🇬" },
]

export const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 1.75, 2] as const

export type BookSummary = {
  id: string
  title: string
  fileName: string
  fileType: string
  totalChunks: number
  createdAt: string
  progress: {
    chunkIndex: number
    positionMs: number
    accent: Accent
    speed: number
    percent: number
  } | null
}

export type ReaderChunk = {
  index: number
  content: string
}

export type ReaderBook = {
  id: string
  title: string
  totalChunks: number
  chunks: ReaderChunk[]
  progress: {
    chunkIndex: number
    positionMs: number
    accent: Accent
    speed: number
  } | null
}