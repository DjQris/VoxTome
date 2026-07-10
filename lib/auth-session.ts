import type { Session } from "next-auth"

import { auth } from "@/auth"

export async function getAuthenticatedSession(): Promise<Session | null> {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  return session
}