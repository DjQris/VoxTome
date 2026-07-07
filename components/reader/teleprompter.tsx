"use client"

import * as React from "react"

import { HighlightedText } from "@/components/reader/highlighted-text"
import type { ReaderChunk } from "@/lib/types"
import {
  TEXT_SIZE_CLASSES,
  type TeleprompterTextSize,
} from "@/lib/reader-utils"
import { cn } from "@/lib/utils"

const WINDOW_RADIUS = 4

type TeleprompterProps = {
  chunks: ReaderChunk[]
  activeIndex: number
  activeWordIndex?: number
  textSize?: TeleprompterTextSize
  onWordClick?: (wordIndex: number) => void
  className?: string
}

export function Teleprompter({
  chunks,
  activeIndex,
  activeWordIndex = 0,
  textSize = "md",
  onWordClick,
  className,
}: TeleprompterProps) {
  const visibleChunks = chunks.filter(
    (chunk) => Math.abs(chunk.index - activeIndex) <= WINDOW_RADIUS
  )
  const activeRef = React.useRef<HTMLParagraphElement>(null)

  React.useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    })
  }, [activeIndex])

  return (
    <div
      className={cn(
        "relative max-h-[50dvh] overflow-y-auto rounded-2xl border bg-card/60 px-4 py-8 sm:max-h-[55dvh] sm:px-8",
        className
      )}
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        {visibleChunks.map((chunk) => {
          const isActive = chunk.index === activeIndex

          return (
            <p
              key={chunk.index}
              ref={isActive ? activeRef : undefined}
              className={cn(
                "transition-all duration-300",
                TEXT_SIZE_CLASSES[textSize],
                isActive ? "scale-[1.01] font-medium" : "text-muted-foreground/70"
              )}
            >
              <HighlightedText
                text={chunk.content}
                activeWordIndex={isActive ? activeWordIndex : 0}
                isActiveChunk={isActive}
                onWordClick={isActive ? onWordClick : undefined}
              />
            </p>
          )
        })}
      </div>
    </div>
  )
}