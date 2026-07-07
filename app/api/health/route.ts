import { NextResponse } from "next/server"

import { getEnvironmentStatus } from "@/lib/env"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const status = getEnvironmentStatus()

  let databaseConnection = "disconnected"

  try {
    await prisma.$queryRaw`SELECT 1`
    databaseConnection = "connected"
  } catch {
    databaseConnection = "disconnected"
  }

  return NextResponse.json({
    ok: status.ready && databaseConnection === "connected",
    databaseConnection,
    ...status,
  })
}