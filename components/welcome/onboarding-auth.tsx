"use client"

import * as React from "react"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
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

type OnboardingAuthProps = {
  className?: string
}

export function OnboardingAuth({ className }: OnboardingAuthProps) {
  const [email, setEmail] = React.useState("")
  const [sent, setSent] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await signIn("resend", {
        email: email.trim(),
        callbackUrl: "/library",
        redirect: false,
      })

      if (result?.error) {
        setError("Could not send the sign-in link. Please try again.")
        return
      }

      setSent(true)
    } catch {
      setError("Could not send the sign-in link. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex w-full max-w-md flex-col gap-8", className)}>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="bg-card text-card-foreground w-[min(85vw,280px)] shrink-0 snap-center rounded-2xl border p-5 shadow-sm"
          >
            <span className="text-2xl" role="img" aria-hidden="true">
              {feature.emoji}
            </span>
            <h2 className="mt-3 font-medium">{feature.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {feature.description}
            </p>
          </article>
        ))}
      </div>

      {sent ? (
        <div className="flex flex-col gap-3 text-center">
          <p className="text-sm font-medium">Check your inbox</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{email}</span>. Tap the
            link in the email to continue.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mx-auto"
            onClick={() => {
              setSent(false)
              setError(null)
            }}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium">Email address</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none focus-visible:ring-3"
            />
          </label>
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            size="lg"
            className="h-11 w-full"
            disabled={isSubmitting || !email.trim()}
          >
            {isSubmitting ? "Sending link…" : "Send magic link"}
          </Button>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            Test mode: use the email on your Resend account until a custom domain
            is verified.
          </p>
        </form>
      )}

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  )
}