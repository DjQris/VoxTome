export function splitWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function getActiveWordIndex(
  text: string,
  currentMs: number,
  durationMs: number
) {
  const words = splitWords(text)

  if (words.length === 0 || durationMs <= 0) {
    return 0
  }

  const progress = Math.min(Math.max(currentMs / durationMs, 0), 1)
  return Math.min(Math.floor(progress * words.length), words.length - 1)
}

export function getSeekMsForWordIndex(
  wordIndex: number,
  text: string,
  durationMs: number
) {
  const words = splitWords(text)

  if (words.length === 0 || durationMs <= 0) {
    return 0
  }

  const progress = Math.min(Math.max(wordIndex / words.length, 0), 1)
  return Math.floor(progress * durationMs)
}

export type TeleprompterTextSize = "sm" | "md" | "lg"

export const TEXT_SIZE_CLASSES: Record<TeleprompterTextSize, string> = {
  sm: "text-sm leading-relaxed sm:text-base sm:leading-relaxed",
  md: "text-base leading-relaxed sm:text-lg sm:leading-loose",
  lg: "text-lg leading-loose sm:text-xl sm:leading-loose",
}