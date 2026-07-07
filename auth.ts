import NextAuth from "next-auth"
import Apple from "next-auth/providers/apple"
import Google from "next-auth/providers/google"

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
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
})