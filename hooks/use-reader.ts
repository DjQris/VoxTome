"use client"

import * as React from "react"

import { getActiveWordIndex } from "@/lib/reader-utils"
import {
  saveProgressBeacon,
  saveProgressWithQueue,
} from "@/lib/progress-queue"
import type { Accent, ReaderChunk } from "@/lib/types"

const SEEK_STEP_MS = 10_000

type ReaderProgress = {
  chunkIndex: number
  positionMs: number
  accent: Accent
  speed: number
} | null

type UseReaderOptions = {
  bookId: string
  totalChunks: number
  progress: ReaderProgress
  getChunk: (index: number) => ReaderChunk | undefined
}

export function useReader({
  bookId,
  totalChunks,
  progress,
  getChunk,
}: UseReaderOptions) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [chunkIndex, setChunkIndex] = React.useState(progress?.chunkIndex ?? 0)
  const [accent, setAccent] = React.useState<Accent>(
    progress?.accent ?? "AMERICAN"
  )
  const [speed, setSpeed] = React.useState(progress?.speed ?? 1)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [isLoadingAudio, setIsLoadingAudio] = React.useState(false)
  const [showTeleprompter, setShowTeleprompter] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [positionMs, setPositionMs] = React.useState(progress?.positionMs ?? 0)
  const [durationMs, setDurationMs] = React.useState(0)
  const [isProgressQueued, setIsProgressQueued] = React.useState(false)

  const currentChunk = getChunk(chunkIndex)
  const hasStarted = React.useRef(false)
  const shouldRestorePosition = React.useRef(
    (progress?.positionMs ?? 0) > 0 &&
      (progress?.chunkIndex ?? 0) === chunkIndex
  )

  const activeWordIndex = React.useMemo(() => {
    if (!currentChunk) {
      return 0
    }

    return getActiveWordIndex(
      currentChunk.content,
      positionMs,
      durationMs
    )
  }, [currentChunk, durationMs, positionMs])

  const buildPayload = React.useCallback(
    (overrides?: {
      chunkIndex?: number
      positionMs?: number
      accent?: Accent
      speed?: number
    }) => ({
      bookId,
      chunkIndex: overrides?.chunkIndex ?? chunkIndex,
      positionMs: overrides?.positionMs ?? positionMs,
      accent: overrides?.accent ?? accent,
      speed: overrides?.speed ?? speed,
    }),
    [accent, bookId, chunkIndex, positionMs, speed]
  )

  const saveProgress = React.useCallback(
    async (overrides?: {
      chunkIndex?: number
      positionMs?: number
      accent?: Accent
      speed?: number
    }) => {
      const result = await saveProgressWithQueue(buildPayload(overrides))
      setIsProgressQueued(result.queued)
    },
    [buildPayload]
  )

  const prefetchAudio = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= totalChunks) {
        return
      }

      void fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, chunkIndex: index, accent }),
      })
    },
    [accent, bookId, totalChunks]
  )

  const loadAudio = React.useCallback(async () => {
    if (!getChunk(chunkIndex)) {
      setError("Loading text for this section...")
      return
    }

    setIsLoadingAudio(true)
    setError(null)

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId, chunkIndex, accent }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? "Failed to load audio")
      }

      const payload = (await response.json()) as { url: string }

      if (!audioRef.current) {
        audioRef.current = new Audio()
      }

      const audio = audioRef.current
      audio.src = payload.url
      audio.playbackRate = speed

      await new Promise<void>((resolve, reject) => {
        const onLoaded = () => {
          setDurationMs(Math.floor(audio.duration * 1000))
          cleanup()
          resolve()
        }

        const onError = () => {
          cleanup()
          reject(new Error("Failed to load audio file"))
        }

        const cleanup = () => {
          audio.removeEventListener("loadedmetadata", onLoaded)
          audio.removeEventListener("error", onError)
        }

        if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
          setDurationMs(Math.floor(audio.duration * 1000))
          resolve()
          return
        }

        audio.addEventListener("loadedmetadata", onLoaded)
        audio.addEventListener("error", onError)
      })

      if (shouldRestorePosition.current) {
        audio.currentTime = (progress?.positionMs ?? 0) / 1000
        shouldRestorePosition.current = false
      } else if (positionMs > 0 && hasStarted.current) {
        audio.currentTime = positionMs / 1000
      } else {
        audio.currentTime = 0
        setPositionMs(0)
      }

      await audio.play()
      setIsPlaying(true)
      hasStarted.current = true
      prefetchAudio(chunkIndex + 1)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : "Playback failed"
      setError(message)
      setIsPlaying(false)
    } finally {
      setIsLoadingAudio(false)
    }
  }, [
    accent,
    bookId,
    chunkIndex,
    getChunk,
    positionMs,
    prefetchAudio,
    progress?.positionMs,
    speed,
  ])

  React.useEffect(() => {
    const audio = audioRef.current

    if (!audio) {
      return
    }

    const onTimeUpdate = () => {
      setPositionMs(Math.floor(audio.currentTime * 1000))
    }

    const onDurationChange = () => {
      if (Number.isFinite(audio.duration)) {
        setDurationMs(Math.floor(audio.duration * 1000))
      }
    }

    const onEnded = () => {
      if (chunkIndex < totalChunks - 1) {
        const nextIndex = chunkIndex + 1
        setChunkIndex(nextIndex)
        setPositionMs(0)
        setDurationMs(0)
        void saveProgress({ chunkIndex: nextIndex, positionMs: 0 })
      } else {
        setIsPlaying(false)
        void saveProgress()
      }
    }

    const onPause = () => setIsPlaying(false)
    const onPlay = () => setIsPlaying(true)

    audio.addEventListener("timeupdate", onTimeUpdate)
    audio.addEventListener("durationchange", onDurationChange)
    audio.addEventListener("ended", onEnded)
    audio.addEventListener("pause", onPause)
    audio.addEventListener("play", onPlay)

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate)
      audio.removeEventListener("durationchange", onDurationChange)
      audio.removeEventListener("ended", onEnded)
      audio.removeEventListener("pause", onPause)
      audio.removeEventListener("play", onPlay)
    }
  }, [chunkIndex, saveProgress, totalChunks])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }, [speed])

  React.useEffect(() => {
    if (!hasStarted.current) {
      return
    }

    void loadAudio()
  }, [chunkIndex, accent, loadAudio])

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      if (isPlaying) {
        void saveProgress()
      }
    }, 10000)

    const onBeforeUnload = () => {
      saveProgressBeacon(buildPayload())
    }

    window.addEventListener("beforeunload", onBeforeUnload)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("beforeunload", onBeforeUnload)
      audioRef.current?.pause()
    }
  }, [buildPayload, isPlaying, saveProgress])

  const seekTo = React.useCallback(
    async (ms: number) => {
      const clamped = Math.max(0, Math.min(ms, durationMs || ms))
      setPositionMs(clamped)

      if (audioRef.current) {
        audioRef.current.currentTime = clamped / 1000
      }

      await saveProgress({ positionMs: clamped })
    },
    [durationMs, saveProgress]
  )

  const seekRelative = React.useCallback(
    async (deltaMs: number) => {
      await seekTo(positionMs + deltaMs)
    },
    [positionMs, seekTo]
  )

  const togglePlayback = React.useCallback(async () => {
    if (!hasStarted.current) {
      await loadAudio()
      return
    }

    const audio = audioRef.current

    if (!audio) {
      return
    }

    if (isPlaying) {
      audio.pause()
      await saveProgress()
      return
    }

    await audio.play()
  }, [isPlaying, loadAudio, saveProgress])

  const goToChunk = React.useCallback(
    async (index: number) => {
      if (index < 0 || index >= totalChunks) {
        return
      }

      audioRef.current?.pause()
      setChunkIndex(index)
      setPositionMs(0)
      setDurationMs(0)
      hasStarted.current = true
      await saveProgress({ chunkIndex: index, positionMs: 0 })
    },
    [saveProgress, totalChunks]
  )

  const changeAccent = React.useCallback(
    async (nextAccent: Accent) => {
      audioRef.current?.pause()
      setAccent(nextAccent)
      setPositionMs(0)
      setDurationMs(0)
      hasStarted.current = true
      await saveProgress({ accent: nextAccent, positionMs: 0 })
    },
    [saveProgress]
  )

  const changeSpeed = React.useCallback(
    async (nextSpeed: number) => {
      setSpeed(nextSpeed)
      await saveProgress({ speed: nextSpeed })
    },
    [saveProgress]
  )

  const retry = React.useCallback(async () => {
    setError(null)
    await loadAudio()
  }, [loadAudio])

  return {
    chunkIndex,
    accent,
    speed,
    positionMs,
    durationMs,
    isPlaying,
    isLoadingAudio,
    showTeleprompter,
    setShowTeleprompter,
    currentChunk,
    activeWordIndex,
    isProgressQueued,
    error,
    togglePlayback,
    goToChunk,
    changeAccent,
    changeSpeed,
    seekTo,
    seekRelative,
    retry,
    seekBack: () => seekRelative(-SEEK_STEP_MS),
    seekForward: () => seekRelative(SEEK_STEP_MS),
  }
}