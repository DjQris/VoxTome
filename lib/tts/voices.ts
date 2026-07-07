import type { Accent } from "@/lib/types"

export const VOICE_IDS: Record<Accent, string> = {
  BRITISH: process.env.ELEVENLABS_VOICE_BRITISH ?? "JBFqnCBsd6RMkjVDRZzb",
  AMERICAN: process.env.ELEVENLABS_VOICE_AMERICAN ?? "21m00Tcm4TlvDq8ikWAM",
  NIGERIAN:
    process.env.ELEVENLABS_VOICE_NIGERIAN ?? "21m00Tcm4TlvDq8ikWAM",
}

export function getVoiceId(accent: Accent) {
  return VOICE_IDS[accent]
}

export function getAudioCachePath(
  bookId: string,
  chunkIndex: number,
  accent: Accent
) {
  return `audio/${bookId}/${chunkIndex}-${accent.toLowerCase()}.mp3`
}