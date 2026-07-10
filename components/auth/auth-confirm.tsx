"use client"

import { useSearchParams } from "next/navigation"
import * as React from "react"

import { Button } from "@/components/ui/button"

export function AuthConfirm() {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const callbackUrl = searchParams.get("callbackUrl") ?? "/library"

  const isValid = Boolean(token && email)

  const handleContinue = () => {
    if (!token || !email) return

    setIsSubmitting(true)

    const params = new URLSearchParams({
      token,
      email,
      callbackUrl,
    })

    window.location.href = `/api/auth/callback/resend?${params.toString()}`
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl" role="img" aria-label="Book">
            📖
          </span>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Continue to VoxTome
          </h1>
        </div>

        {isValid ? (
          <>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tap the button below to finish signing in as{" "}
              <span className="font-medium text-foreground">{email}</span>.
            </p>
            <Button
              size="lg"
              className="h-11 w-full"
              disabled={isSubmitting}
              onClick={handleContinue}
            >
              {isSubmitting ? "Signing in…" : "Continue"}
            </Button>
          </>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            This sign-in link is incomplete. Request a new magic link from the
            welcome page.
          </p>
        )}
      </div>
    </main>
  )
}