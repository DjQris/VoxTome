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

const MARQUEE_SPEED = 48

type FeatureMarqueeProps = {
  className?: string
}

function FeatureCard({
  feature,
}: {
  feature: (typeof FEATURES)[number]
}) {
  return (
    <article className="bg-card text-card-foreground w-[min(85vw,260px)] shrink-0 rounded-2xl border p-5 shadow-sm select-none sm:w-[260px]">
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
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const trackRef = React.useRef<HTMLDivElement>(null)
  const offsetRef = React.useRef(0)
  const loopWidthRef = React.useRef(0)
  const isDraggingRef = React.useRef(false)
  const isPausedRef = React.useRef(false)
  const lastPointerXRef = React.useRef(0)
  const resumeTimeoutRef = React.useRef<number | null>(null)
  const rafRef = React.useRef(0)
  const lastFrameTimeRef = React.useRef(0)

  const applyOffset = React.useCallback(() => {
    const track = trackRef.current
    if (!track) return

    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
  }, [])

  const normalizeOffset = React.useCallback(() => {
    const loopWidth = loopWidthRef.current
    if (loopWidth <= 0) return

    while (offsetRef.current <= -loopWidth) {
      offsetRef.current += loopWidth
    }

    while (offsetRef.current > 0) {
      offsetRef.current -= loopWidth
    }
  }, [])

  const measure = React.useCallback(() => {
    const track = trackRef.current
    if (!track) return

    loopWidthRef.current = track.scrollWidth / 2
    normalizeOffset()
    applyOffset()
  }, [applyOffset, normalizeOffset])

  const pause = React.useCallback(() => {
    isPausedRef.current = true
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current)
      resumeTimeoutRef.current = null
    }
  }, [])

  const scheduleResume = React.useCallback((delayMs = 1000) => {
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current)
    }

    resumeTimeoutRef.current = window.setTimeout(() => {
      isPausedRef.current = false
      resumeTimeoutRef.current = null
    }, delayMs)
  }, [])

  React.useEffect(() => {
    measure()

    const track = trackRef.current
    if (!track) return

    const resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(track)

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )

    const tick = (time: number) => {
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = time
      }

      const deltaSeconds = (time - lastFrameTimeRef.current) / 1000
      lastFrameTimeRef.current = time

      if (
        !reducedMotion.matches &&
        !isPausedRef.current &&
        !isDraggingRef.current &&
        loopWidthRef.current > 0
      ) {
        offsetRef.current -= MARQUEE_SPEED * deltaSeconds
        normalizeOffset()
        applyOffset()
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }

    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      resizeObserver.disconnect()
      window.cancelAnimationFrame(rafRef.current)
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current)
      }
    }
  }, [applyOffset, measure, normalizeOffset])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return

    const viewport = viewportRef.current
    if (!viewport) return

    isDraggingRef.current = true
    pause()
    lastPointerXRef.current = event.clientX
    viewport.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    const deltaX = event.clientX - lastPointerXRef.current
    lastPointerXRef.current = event.clientX

    offsetRef.current += deltaX
    normalizeOffset()
    applyOffset()
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return

    const viewport = viewportRef.current
    isDraggingRef.current = false

    if (viewport?.hasPointerCapture(event.pointerId)) {
      viewport.releasePointerCapture(event.pointerId)
    }

    normalizeOffset()
    applyOffset()
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
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-background to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent"
        aria-hidden="true"
      />

      <div
        ref={viewportRef}
        role="region"
        aria-label="VoxTome features"
        className={cn(
          "overflow-hidden pb-2",
          "cursor-grab touch-pan-y active:cursor-grabbing"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={() => {
          isDraggingRef.current = false
          scheduleResume()
        }}
      >
        <div
          ref={trackRef}
          className="flex w-max gap-3 px-6 will-change-transform"
        >
          {duplicatedFeatures.map((feature, index) => (
            <FeatureCard
              key={`${feature.title}-${index}`}
              feature={feature}
            />
          ))}
        </div>
      </div>
    </div>
  )
}