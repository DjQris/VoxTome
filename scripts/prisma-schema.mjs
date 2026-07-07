import { existsSync } from "node:fs"

const databaseUrl = process.env.DATABASE_URL ?? ""

const isPostgres =
  databaseUrl.startsWith("postgres://") ||
  databaseUrl.startsWith("postgresql://")

export const prismaSchema = isPostgres
  ? "prisma/schema.postgres.prisma"
  : "prisma/schema.prisma"

export function resolvePrismaEnvPath() {
  if (existsSync("prisma/.env")) {
    return "prisma/.env"
  }

  return undefined
}