import { execSync } from "node:child_process"

import { prismaSchema } from "./prisma-schema.mjs"

execSync(`npx prisma db push --schema=${prismaSchema}`, {
  stdio: "inherit",
})

console.log(`Database schema pushed via ${prismaSchema}`)