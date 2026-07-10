import type { NextAuthConfig } from "next-auth"
import Resend from "next-auth/providers/resend"

const resendProvider = Resend({
  from: process.env.AUTH_RESEND_FROM ?? "onboarding@resend.dev",
})

export const authConfig = {
  trustHost: true,
  providers: [
    {
      ...resendProvider,
      async sendVerificationRequest(params) {
        const original = new URL(params.url)
        const confirmUrl = new URL("/auth/confirm", original.origin)

        for (const key of ["token", "email", "callbackUrl"] as const) {
          const value = original.searchParams.get(key)
          if (value) {
            confirmUrl.searchParams.set(key, value)
          }
        }

        return resendProvider.sendVerificationRequest({
          ...params,
          url: confirmUrl.toString(),
        })
      },
    },
  ],
  pages: {
    signIn: "/welcome",
    error: "/welcome",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    signIn() {
      return true
    },
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? ""
        session.user.email = token.email ?? session.user.email
        session.user.name = token.name ?? session.user.name
      }
      return session
    },
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }

      if (url.startsWith(baseUrl)) {
        return url
      }

      return `${baseUrl}/library`
    },
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