import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function normalizeEmail(email: string) {
  return email.toLowerCase().trim()
}

export async function getSessionUser() {
  const session = await auth()

  if (!session?.user?.email || !session.user.id) {
    return null
  }

  const email = normalizeEmail(session.user.email)

  const byId = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { preferences: true },
  })

  if (byId) {
    if (byId.email !== email) {
      return prisma.user.update({
        where: { id: byId.id },
        data: {
          email,
          name: session.user.name ?? byId.name,
          image: session.user.image ?? byId.image,
        },
        include: { preferences: true },
      })
    }

    return byId
  }

  const byEmail = await prisma.user.findUnique({
    where: { email },
    include: { preferences: true },
  })

  if (byEmail) {
    return byEmail
  }

  return prisma.user.create({
    data: {
      id: session.user.id,
      email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
      preferences: {
        create: {},
      },
    },
    include: { preferences: true },
  })
}

export async function requireSessionUser() {
  const user = await getSessionUser()

  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}