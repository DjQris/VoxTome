"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

const FEATURES = [
  {
    emoji: "📚",
    title: "Upload any book",
    description: "PDF, DOCX, EPUB — bring your library with you.",
  },
  {
    emoji: "🎙️",
    title: "Listen your way",
    description: "British, American, or Nigerian English accents.",
  },
  {
    emoji: "📍",
    title: "Pick up where you left off",
    description: "Your progress is saved automatically.",
  },
] as const

const SCROLL_SPEED = 0.6

type FeatureMarqueeProps = {
  className?: string
}

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[number]
}) {
  return (
    <article className="bg-card text-card-foreground w-[min(85vw,260px)] shrink-0 snap-center rounded-2xl border p-5 shadow-sm select-none sm:w-[260px]">
      <span className="text-2xl" role="img" aria-hidden="true">
        {feature.emoji}
      </span>
      <h2 className="mt-3 font-medium">{feature.title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {feature.description}
      </p>
    </article>
  )
}

export function FeatureMarquee({ className }: FeatureMarqueeProps) {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const loopWidthRef = React.useRef(0)
  const isDraggingRef = React.useRef(false)
  const isPausedRef = React.useRef(false)
  const dragStartXRef = React.useRef(0)
  const dragStartScrollRef = React.useRef(0)
  const resumeTimeoutRef = React.useRef<number | null>(null)

  const normalizeScroll = React.useCallback((element: HTMLDivElement) => {
    const loopWidth = loopWidthRef.current
    if (loopWidth <= 0) return

    while (element.scrollLeft >= loopWidth) {
      element.scrollLeft -= loopWidth
    }

    while (element.scrollLeft < 0) {
      element.scrollLeft += loopWidth
    }
  }, [])

  const pause = React.useCallback(() => {
    isPausedRef.current = true
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
  }, [])

  const scheduleResume = React.useCallback((delayMs = 1200) => {
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current)
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      isPausedRef.current = false
      resumeTimeoutRef.current = null
    }, delayMs)
  }, [])

  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      loopWidthRef.current = track.scrollWidth / 2
      normalizeScroll(track)
    }

    measure()

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    let frame = 0
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const tick = () => {
      if (
        !reducedMotion &&
        !isPausedRef.current &&
        !isDraggingRef.current &&
        loopWidthRef.current > 0
      ) {
        track.scrollLeft += SCROLL_SPEED
        normalizeScroll(track)
      }

      frame = window.requestAnimationFrame(tick)
    }

    frame = window.requestAnimationFrame(tick)

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(frame)
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [normalizeScroll])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track) return

    isDraggingRef.current = true
    pause()
    dragStartXRef.current = event.clientX
    dragStartScrollRef.current = track.scrollLeft
    track.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || !isDraggingRef.current) return

    const delta = event.clientX - dragStartXRef.current
    track.scrollLeft = dragStartScrollRef.current - delta
    normalizeScroll(track)
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current
    if (!track || !isDraggingRef.current) return

    isDraggingRef.current = false

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId)
    }

    normalizeScroll(track)
    scheduleResume()
  }

  const duplicatedFeatures = [...FEATURES, ...FEATURES]

  return (
    <div
      className={cn(
        "relative -mx-6 w-[calc(100%+3rem)] sm:mx-0 sm:w-full",
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent"
        aria-hidden="true"
      />

      <div
        ref={trackRef}
        role="region"
        aria-label="VoxTome features"
        className={cn(
          "flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab touch-pan-x active:cursor-grabbing"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(event) => {
          if (isDraggingRef.current) endDrag(event)
        }}
        onMouseEnter={pause}
        onMouseLeave={() => scheduleResume(400)}
        onWheel={(event) => {
          const track = trackRef.current
          if (!track) return

          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            pause()
            track.scrollLeft += event.deltaY
            normalizeScroll(track)
            scheduleResume(800)
          }
        }}
      >
        {duplicatedFeatures.map((feature, index) => (
          <FeatureCard
            key={`${feature.title}-${index}`}
            feature={feature}
          />
        ))}
      </div>
    </div>
  )
}