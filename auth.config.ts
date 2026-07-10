import type { NextAuthConfig } from "next-auth"
import Resend from "next-auth/providers/resend"

export const authConfig = {
  trustHost: true,
  providers: [
    Resend({
      from: process.env.AUTH_RESEND_FROM ?? "onboarding@resend.dev",
    }),
  ],
  pages: {
    signIn: "/welcome",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user
      const isAppRoute =
        request.nextUrl.pathname.startsWith("/library") ||
        request.nextUrl.pathname.startsWith("/upload") ||
        request.nextUrl.pathname.startsWith("/reader") ||
        request.nextUrl.pathname.startsWith("/settings")

      if (isAppRoute) {
        return isLoggedIn
      }

      return true
    },
  },
} satisfies NextAuthConfig