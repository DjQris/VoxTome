"use client"

import * as React from "react"

import { splitWords } from "@/lib/reader-utils"
import { cn } from "@/lib/utils"

type HighlightedTextProps = {
  text: string
  activeWordIndex: number
  isActiveChunk: boolean
  onWordClick?: (wordIndex: number) => void
}

export function HighlightedText({
  text,
  activeWordIndex,
  isActiveChunk,
  onWordClick,
}: HighlightedTextProps) {
  const activeWordRef = React.useRef<HTMLSpanElement>(null)
  const words = splitWords(text)

  React.useEffect(() => {
    if (!isActiveChunk) {
      return
    }

    activeWordRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    })
  }, [activeWordIndex, isActiveChunk])

  if (!isActiveChunk) {
    return <>{text}</>
  }

  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${index}-${word}`}
          ref={index === activeWordIndex ? activeWordRef : undefined}
          role={onWordClick ? "button" : undefined}
          tabIndex={onWordClick ? 0 : undefined}
          onClick={
            onWordClick
              ? () => {
                  onWordClick(index)
                }
              : undefined
          }
          onKeyDown={
            onWordClick
              ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onWordClick(index)
                  }
                }
              : undefined
          }
          className={cn(
            "rounded-sm px-0.5 transition-colors duration-150",
            onWordClick && "cursor-pointer hover:bg-primary/15",
            index === activeWordIndex
              ? "bg-primary/25 text-foreground"
              : index < activeWordIndex
                ? "text-foreground/80"
                : "text-muted-foreground"
          )}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  )
}