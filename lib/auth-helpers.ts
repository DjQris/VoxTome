import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getSessionUser() {
  const session = await auth()

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    create: {
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      preferences: {
        create: {},
      },
    },
    update: {
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
    include: {
      preferences: true,
    },
  })

  return user
}

export async function requireSessionUser() {
  const user = await getSessionUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}