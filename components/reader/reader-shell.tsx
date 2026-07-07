"use client"

import * as React from "react"
import Link from "next/link"
import { CloudSlashIcon } from "@phosphor-icons/react"

import { ReaderControls } from "@/components/reader/reader-controls"
import { ReaderLoadingOverlay } from "@/components/reader/reader-loading-overlay"
import { Teleprompter } from "@/components/reader/teleprompter"
import { HighlightedText } from "@/components/reader/highlighted-text"
import { Button } from "@/components/ui/button"
import { useBookChunks } from "@/hooks/use-book-chunks"
import { useMediaSession } from "@/hooks/use-media-session"
import { useReader } from "@/hooks/use-reader"
import { useReaderKeyboard } from "@/hooks/use-reader-keyboard"
import { useWakeLock } from "@/hooks/use-wake-lock"
import {
  getSeekMsForWordIndex,
  type TeleprompterTextSize,
} from "@/lib/reader-utils"
import type { ReaderBook } from "@/lib/types"

const TEXT_SIZE_KEY = "voxtome-teleprompter-text-size"

type ReaderShellProps = {
  book: ReaderBook
}

function loadTextSize(): TeleprompterTextSize {
  if (typeof window === "undefined") {
    return "md"
  }

  const stored = window.localStorage.getItem(TEXT_SIZE_KEY)

  if (stored === "sm" || stored === "md" || stored === "lg") {
    return stored
  }

  return "md"
}

export function ReaderShell({ book }: ReaderShellProps) {
  const [textSize, setTextSize] = React.useState<TeleprompterTextSize>("md")

  React.useEffect(() => {
    setTextSize(loadTextSize())
  }, [])

  const { chunks, getChunk, syncActiveIndex } = useBookChunks({
    bookId: book.id,
    totalChunks: book.totalChunks,
    initialChunks: book.chunks,
    initialActiveIndex: book.progress?.chunkIndex ?? 0,
  })

  const reader = useReader({
    bookId: book.id,
    totalChunks: book.totalChunks,
    progress: book.progress,
    getChunk,
  })

  const {
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
    seekBack,
    seekForward,
    retry,
  } = reader

  React.useEffect(() => {
    syncActiveIndex(chunkIndex)
  }, [chunkIndex, syncActiveIndex])

  const handleWordClick = React.useCallback(
    (wordIndex: number) => {
      if (!currentChunk) {
        return
      }

      const targetMs = getSeekMsForWordIndex(
        wordIndex,
        currentChunk.content,
        durationMs
      )

      void seekTo(targetMs)

      if (!isPlaying && !isLoadingAudio) {
        void togglePlayback()
      }
    },
    [
      currentChunk,
      durationMs,
      isLoadingAudio,
      isPlaying,
      seekTo,
      togglePlayback,
    ]
  )

  const handleTextSizeChange = React.useCallback((size: TeleprompterTextSize) => {
    setTextSize(size)
    window.localStorage.setItem(TEXT_SIZE_KEY, size)
  }, [])

  useReaderKeyboard({
    onTogglePlayback: () => void togglePlayback(),
    onPrevious: () => void goToChunk(chunkIndex - 1),
    onNext: () => void goToChunk(chunkIndex + 1),
    onSeekBack: () => void seekBack(),
    onSeekForward: () => void seekForward(),
  })

  useMediaSession({
    title: book.title,
    isPlaying,
    onPlay: () => void togglePlayback(),
    onPause: () => void togglePlayback(),
    onPrevious: () => void goToChunk(chunkIndex - 1),
    onNext: () => void goToChunk(chunkIndex + 1),
  })

  useWakeLock(isPlaying)

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col">
      <div className="mb-4 flex items-center justify-between gap-3 px-4 sm:px-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Now reading
          </p>
          <h1 className="font-heading text-xl font-semibold sm:text-2xl">
            {book.title}
          </h1>
        </div>
        <Link href="/library">
          <Button variant="ghost" size="sm">
            Library
          </Button>
        </Link>
      </div>

      {isProgressQueued ? (
        <div className="mx-4 mb-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-800 sm:mx-6 dark:text-amber-200">
          <CloudSlashIcon className="size-4 shrink-0" />
          Progress saved locally — will sync when you&apos;re back online.
        </div>
      ) : null}

      {error ? (
        <div className="mx-4 mb-4 flex flex-col gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive sm:mx-6">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="w-fit border-destructive/30"
            onClick={() => void retry()}
          >
            Try again
          </Button>
        </div>
      ) : null}

      <div className="relative mx-4 flex-1 sm:mx-6">
        {showTeleprompter ? (
          <Teleprompter
            chunks={chunks}
            activeIndex={chunkIndex}
            activeWordIndex={activeWordIndex}
            textSize={textSize}
            onWordClick={(wordIndex) => handleWordClick(wordIndex)}
          />
        ) : (
          <div className="flex min-h-[40dvh] items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Audio-only mode</p>
              <p className="mt-4 text-base leading-relaxed sm:text-lg">
                {currentChunk ? (
                  <HighlightedText
                    text={currentChunk.content}
                    activeWordIndex={activeWordIndex}
                    isActiveChunk
                    onWordClick={(wordIndex) => handleWordClick(wordIndex)}
                  />
                ) : (
                  "Loading section..."
                )}
              </p>
            </div>
          </div>
        )}

        <ReaderLoadingOverlay visible={isLoadingAudio} />
      </div>

      <ReaderControls
        title={book.title}
        chunkIndex={chunkIndex}
        totalChunks={book.totalChunks}
        accent={accent}
        speed={speed}
        positionMs={positionMs}
        durationMs={durationMs}
        textSize={textSize}
        isPlaying={isPlaying}
        isLoadingAudio={isLoadingAudio}
        showTeleprompter={showTeleprompter}
        onTogglePlayback={() => void togglePlayback()}
        onPrevious={() => void goToChunk(chunkIndex - 1)}
        onNext={() => void goToChunk(chunkIndex + 1)}
        onGoToSection={(index) => void goToChunk(index)}
        onAccentChange={(value) => void changeAccent(value)}
        onSpeedChange={(value) => void changeSpeed(value)}
        onTextSizeChange={handleTextSizeChange}
        onToggleTeleprompter={() => setShowTeleprompter((value) => !value)}
        onSeek={(value) => void seekTo(value)}
      />
    </div>
  )
}