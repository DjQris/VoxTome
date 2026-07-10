import { redirect } from "next/navigation"
import { Suspense } from "react"

import { WelcomeFlow } from "@/components/welcome/welcome-flow"
import { getAuthenticatedSession } from "@/lib/auth-session"

export const dynamic = "force-dynamic"

export default async function WelcomePage() {
  const session = await getAuthenticatedSession()

  if (session) {
    redirect("/library")
  }

  return (
    <Suspense fallback={null}>
      <WelcomeFlow />
    </Suspense>
  )
}