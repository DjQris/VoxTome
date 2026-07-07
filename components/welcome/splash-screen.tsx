"use client"

import { cn } from "@/lib/utils"

const TITLE = "VoxTome"

type SplashScreenProps = {
  className?: string
}

export function SplashScreen({ className }: SplashScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          className="animate-splash-bounce text-4xl sm:text-5xl"
          role="img"
          aria-label="Book"
        >
          📖
        </span>
        <span
          className="animate-splash-pulse text-4xl sm:text-5xl"
          role="img"
          aria-label="Audio"
        >
          🎧
        </span>
      </div>

      <h1 className="font-heading flex text-4xl font-semibold tracking-tight sm:text-5xl">
        {TITLE.split("").map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="animate-letter-reveal inline-block opacity-0"
            style={{ animationDelay: `${0.4 + index * 0.08}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>

      <p
        className="mt-4 max-w-xs animate-fade-up text-sm text-muted-foreground opacity-0 sm:text-base"
        style={{ animationDelay: "1.1s" }}
      >
        Your books, read aloud
      </p>
    </div>
  )
}