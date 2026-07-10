import { Suspense } from "react"

import { WelcomeFlow } from "@/components/welcome/welcome-flow"

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <WelcomeFlow />
    </Suspense>
  )
}