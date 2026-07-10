import type { Accent } from "@/lib/types"

// Premade ElevenLabs voices — free-tier API access. Library/community voices
// require a paid ElevenLabs plan (paid_plan_required).
const PREMADE_VOICES = {
  BRITISH: "onwK4e9ZLuTAKqWW03F9", // Daniel — British male
  AMERICAN: "21m00Tcm4TlvDq8ikWAM", // Rachel — American female
  NIGERIAN: "21m00Tcm4TlvDq8ikWAM", // No free premade Nigerian voice; falls back to Rachel
} as const satisfies Record<Accent, string>

function resolveVoiceId(accent: Accent, envValue: string | undefined) {
  const trimmed = envValue?.trim()
  return trimmed || PREMADE_VOICES[accent]
}

export const VOICE_IDS: Record<Accent, string> = {
  BRITISH: resolveVoiceId("BRITISH", process.env.ELEVENLABS_VOICE_BRITISH),
  AMERICAN: resolveVoiceId("AMERICAN", process.env.ELEVENLABS_VOICE_AMERICAN),
  NIGERIAN: resolveVoiceId("NIGERIAN", process.env.ELEVENLABS_VOICE_NIGERIAN),
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