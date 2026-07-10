import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"

import { authConfig } from "@/auth.config"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  events: {
    async createUser({ user }) {
      if (!user.id) return

      try {
        await prisma.userPreferences.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {},
        })
      } catch (error) {
        console.error("Failed to create user preferences:", error)
      }
    },
  },
})