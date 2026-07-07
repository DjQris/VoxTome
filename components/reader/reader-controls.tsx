"use client"

import * as React from "react"
import {
  CaretLeftIcon,
  CaretRightIcon,
  PauseIcon,
  PlayIcon,
  TextAaIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ACCENTS, SPEED_OPTIONS, type Accent } from "@/lib/types"
import type { TeleprompterTextSize } from "@/lib/reader-utils"
import { cn } from "@/lib/utils"

type ReaderControlsProps = {
  title: string
  chunkIndex: number
  totalChunks: number
  accent: Accent
  speed: number
  positionMs: number
  durationMs: number
  textSize: TeleprompterTextSize
  isPlaying: boolean
  isLoadingAudio: boolean
  showTeleprompter: boolean
  onTogglePlayback: () => void
  onPrevious: () => void
  onNext: () => void
  onGoToSection: (index: number) => void
  onAccentChange: (accent: Accent) => void
  onSpeedChange: (speed: number) => void
  onTextSizeChange: (size: TeleprompterTextSize) => void
  onToggleTeleprompter: () => void
  onSeek: (positionMs: number) => void
  className?: string
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function ReaderControls({
  title,
  chunkIndex,
  totalChunks,
  accent,
  speed,
  positionMs,
  durationMs,
  textSize,
  isPlaying,
  isLoadingAudio,
  showTeleprompter,
  onTogglePlayback,
  onPrevious,
  onNext,
  onGoToSection,
  onAccentChange,
  onSpeedChange,
  onTextSizeChange,
  onToggleTeleprompter,
  onSeek,
  className,
}: ReaderControlsProps) {
  const [scrubMs, setScrubMs] = React.useState(positionMs)
  const [sectionInput, setSectionInput] = React.useState(String(chunkIndex + 1))
  const isScrubbingRef = React.useRef(false)

  React.useEffect(() => {
    if (!isScrubbingRef.current) {
      setScrubMs(positionMs)
    }
  }, [positionMs])

  React.useEffect(() => {
    setSectionInput(String(chunkIndex + 1))
  }, [chunkIndex])

  const bookProgressPercent =
    totalChunks > 0
      ? Math.round(
          ((chunkIndex + (durationMs > 0 ? positionMs / durationMs : 0)) /
            totalChunks) *
            100
        )
      : 0

  const sectionProgressPercent =
    durationMs > 0 ? Math.round((scrubMs / durationMs) * 100) : 0

  const commitSectionJump = () => {
    const parsed = Number(sectionInput)

    if (!Number.isFinite(parsed)) {
      setSectionInput(String(chunkIndex + 1))
      return
    }

    const target = Math.min(
      Math.max(Math.floor(parsed) - 1, 0),
      totalChunks - 1
    )

    onGoToSection(target)
  }

  const commitScrub = () => {
    isScrubbingRef.current = false
    onSeek(scrubMs)
  }

  return (
    <div
      className={cn(
        "sticky bottom-0 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6",
        "pb-[max(1rem,env(safe-area-inset-bottom))]",
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-medium">{title}</p>
            <p className="shrink-0 text-xs text-muted-foreground">
              {bookProgressPercent}%
            </p>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${bookProgressPercent}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="shrink-0">Section</span>
            <input
              type="number"
              min={1}
              max={totalChunks}
              value={sectionInput}
              disabled={isLoadingAudio}
              onChange={(event) => setSectionInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  commitSectionJump()
                }
              }}
              onBlur={commitSectionJump}
              className="h-7 w-16 rounded-md border bg-background px-2 text-center text-sm text-foreground"
              aria-label="Jump to section"
            />
            <span className="shrink-0">of {totalChunks}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevious}
            disabled={chunkIndex === 0 || isLoadingAudio}
            aria-label="Previous section"
          >
            <CaretLeftIcon />
          </Button>
          <Button
            size="icon-lg"
            onClick={onTogglePlayback}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={onNext}
            disabled={chunkIndex >= totalChunks - 1 || isLoadingAudio}
            aria-label="Next section"
          >
            <CaretRightIcon />
          </Button>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Section progress</span>
            <span>
              {formatTime(isScrubbingRef.current ? scrubMs : positionMs)}
              {durationMs > 0 ? ` / ${formatTime(durationMs)}` : ""}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={durationMs || 1}
            value={scrubMs}
            disabled={durationMs <= 0 || isLoadingAudio}
            onPointerDown={() => {
              isScrubbingRef.current = true
            }}
            onPointerUp={commitScrub}
            onPointerCancel={commitScrub}
            onChange={(event) => {
              setScrubMs(Number(event.target.value))
            }}
            className="h-1.5 w-full cursor-pointer accent-primary disabled:opacity-50"
            aria-label="Seek within section"
          />
          <div className="h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/60 transition-all"
              style={{ width: `${sectionProgressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Accent
            <select
              value={accent}
              onChange={(event) =>
                onAccentChange(event.target.value as Accent)
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground"
            >
              {ACCENTS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.flag} {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Speed
            <select
              value={speed}
              onChange={(event) => onSpeedChange(Number(event.target.value))}
              className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground"
            >
              {SPEED_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}x
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Text size
            <select
              value={textSize}
              onChange={(event) =>
                onTextSizeChange(event.target.value as TeleprompterTextSize)
              }
              className="h-9 rounded-lg border bg-background px-3 text-sm text-foreground"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </label>

          <div className="flex items-end">
            <Button
              variant={showTeleprompter ? "secondary" : "outline"}
              className="h-9 w-full gap-2"
              onClick={onToggleTeleprompter}
            >
              <TextAaIcon />
              {showTeleprompter ? "Hide text" : "Show text"}
            </Button>
          </div>
        </div>

        <p className="hidden text-center text-[11px] text-muted-foreground sm:block">
          Space to play/pause · ←/→ seek 10s · Shift+←/→ change section · Tap a
          word to jump
        </p>
      </div>
    </div>
  )
}