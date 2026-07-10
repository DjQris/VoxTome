import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    ...authConfig.callbacks,
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
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return

      await prisma.userPreferences.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      })
    },
  },
})