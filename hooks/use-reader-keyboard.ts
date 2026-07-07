"use client"

import * as React from "react"

type ReaderKeyboardOptions = {
  onTogglePlayback: () => void
  onPrevious: () => void
  onNext: () => void
  onSeekBack: () => void
  onSeekForward: () => void
  enabled?: boolean
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

export function useReaderKeyboard({
  onTogglePlayback,
  onPrevious,
  onNext,
  onSeekBack,
  onSeekForward,
  enabled = true,
}: ReaderKeyboardOptions) {
  React.useEffect(() => {
    if (!enabled) {
      return
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat || isTypingTarget(event.target)) {
        return
      }

      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault()
          onTogglePlayback()
          break
        case "ArrowLeft":
          event.preventDefault()
          if (event.shiftKey) {
            onPrevious()
          } else {
            onSeekBack()
          }
          break
        case "ArrowRight":
          event.preventDefault()
          if (event.shiftKey) {
            onNext()
          } else {
            onSeekForward()
          }
          break
        case "j":
          event.preventDefault()
          onSeekBack()
          break
        case "l":
          event.preventDefault()
          onSeekForward()
          break
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [
    enabled,
    onNext,
    onPrevious,
    onSeekBack,
    onSeekForward,
    onTogglePlayback,
  ])
}