import { execSync } from "node:child_process"

import { prismaSchema } from "./prisma-schema.mjs"

execSync(`npx prisma generate --schema=${prismaSchema}`, {
  stdio: "inherit",
})

console.log(`Prisma client generated from ${prismaSchema}`)