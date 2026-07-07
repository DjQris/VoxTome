"use client"

import * as React from "react"

type MediaSessionOptions = {
  title: string
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onPrevious: () => void
  onNext: () => void
}

export function useMediaSession({
  title,
  isPlaying,
  onPlay,
  onPause,
  onPrevious,
  onNext,
}: MediaSessionOptions) {
  React.useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: "VoxTome",
      album: "Audiobook",
    })

    navigator.mediaSession.setActionHandler("play", onPlay)
    navigator.mediaSession.setActionHandler("pause", onPause)
    navigator.mediaSession.setActionHandler("previoustrack", onPrevious)
    navigator.mediaSession.setActionHandler("nexttrack", onNext)

    return () => {
      navigator.mediaSession.setActionHandler("play", null)
      navigator.mediaSession.setActionHandler("pause", null)
      navigator.mediaSession.setActionHandler("previoustrack", null)
      navigator.mediaSession.setActionHandler("nexttrack", null)
    }
  }, [onNext, onPause, onPlay, onPrevious, title])

  React.useEffect(() => {
    if (!("mediaSession" in navigator)) {
      return
    }

    navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused"
  }, [isPlaying])
}