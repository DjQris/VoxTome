import type { Accent } from "@/lib/types"
import { getVoiceId } from "@/lib/tts/voices"

const MODEL_ID = "eleven_turbo_v2_5"

export async function synthesizeSpeech({
  text,
  accent,
  previousText,
  nextText,
}: {
  text: string
  accent: Accent
  previousText?: string
  nextText?: string
}) {
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY is not configured")
  }

  const voiceId = getVoiceId(accent)
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: MODEL_ID,
        previous_text: previousText,
        next_text: nextText,
      }),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(details || "ElevenLabs synthesis failed")
  }

  return Buffer.from(await response.arrayBuffer())
}