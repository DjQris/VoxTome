"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import * as React from "react"
import { toast } from "sonner"

import { OnboardingAuth } from "@/components/welcome/onboarding-auth"
import { SplashScreen } from "@/components/welcome/splash-screen"
import { cn } from "@/lib/utils"

const SPLASH_DURATION_MS = 2500

const AUTH_ERRORS: Record<string, string> = {
  Verification: "This sign-in link has expired or was already used. Request a new one.",
  Configuration: "Sign-in is not configured correctly. Please try again later.",
  Default: "Sign-in failed. Please request a new magic link.",
}

export function WelcomeFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [phase, setPhase] = React.useState<"splash" | "onboarding">("splash")

  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/library")
    }
  }, [router, status])

  React.useEffect(() => {
    const error = searchParams.get("error")
    if (!error) return

    toast.error(AUTH_ERRORS[error] ?? AUTH_ERRORS.Default)
    router.replace("/welcome")
  }, [router, searchParams])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setPhase("onboarding")
    }, SPLASH_DURATION_MS)

    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-start overflow-y-auto overscroll-y-contain px-6 py-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:justify-center">
      {phase === "splash" ? (
        <div className="absolute inset-0 flex items-center justify-center px-6 transition-opacity duration-700">
          <SplashScreen />
        </div>
      ) : null}

      <div
        className={cn(
          "relative z-10 flex w-full max-w-md flex-col items-center py-4 transition-all duration-700 sm:py-0",
          phase === "onboarding"
            ? "translate-y-0 opacity-100"
            : "pointer-events-none absolute inset-x-6 top-0 translate-y-4 opacity-0"
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
            Enter your email to start listening
          </p>
        </div>

        <OnboardingAuth />
      </div>
    </main>
  )
}