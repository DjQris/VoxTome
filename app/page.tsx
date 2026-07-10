import { redirect } from "next/navigation"

import { getAuthenticatedSession } from "@/lib/auth-session"

export const dynamic = "force-dynamic"

export default async function Page() {
  const session = await getAuthenticatedSession()

  if (session) {
    redirect("/library")
  }

  redirect("/welcome")
}