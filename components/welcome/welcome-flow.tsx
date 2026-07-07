"use client"

import * as React from "react"

import { OnboardingAuth } from "@/components/welcome/onboarding-auth"
import { SplashScreen } from "@/components/welcome/splash-screen"
import { cn } from "@/lib/utils"

const SPLASH_DURATION_MS = 2500

export function WelcomeFlow() {
  const [phase, setPhase] = React.useState<"splash" | "onboarding">("splash")

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("onboarding")
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.5rem,env(safe-area-inset-top))]">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center px-6 transition-all duration-700",
          phase === "splash"
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-4 opacity-0"
        )}
      >
        <SplashScreen />
      </div>

      <div
        className={cn(
          "relative z-10 flex w-full flex-col items-center transition-all duration-700 delay-150",
          phase === "onboarding"
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0"
        )}
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Book">
              📖
            </span>
            <span className="text-2xl" role="img" aria-label="Audio">
              🎧
            </span>
          </div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            VoxTome
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to start listening
          </p>
        </div>

        <OnboardingAuth />
      </div>
    </main>
  )
}