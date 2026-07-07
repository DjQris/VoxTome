import { NextResponse } from "next/server"

import { requireSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Accent } from "@/lib/types"
import { toAccent } from "@/lib/types"

export async function GET() {
  try {
    const user = await requireSessionUser()

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    })

    return NextResponse.json({
      defaultAccent: toAccent(preferences.defaultAccent),
      defaultSpeed: preferences.defaultSpeed,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load settings"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = (await request.json()) as {
      defaultAccent?: Accent
      defaultSpeed?: number
    }

    const preferences = await prisma.userPreferences.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultAccent: body.defaultAccent ?? "AMERICAN",
        defaultSpeed: body.defaultSpeed ?? 1,
      },
      update: {
        ...(body.defaultAccent ? { defaultAccent: body.defaultAccent } : {}),
        ...(body.defaultSpeed !== undefined
          ? { defaultSpeed: body.defaultSpeed }
          : {}),
      },
    })

    return NextResponse.json({
      defaultAccent: toAccent(preferences.defaultAccent),
      defaultSpeed: preferences.defaultSpeed,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save settings"

    if (message === "Unauthorized") {
      return NextResponse.json({ error: message }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}