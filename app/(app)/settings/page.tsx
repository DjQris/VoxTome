import { getSessionUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { toAccent } from "@/lib/types"
import { SettingsForm } from "@/components/settings/settings-form"

export default async function SettingsPage() {
  const user = await getSessionUser()

  const preferences = user
    ? await prisma.userPreferences.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      })
    : null

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Customize your default listening experience.
        </p>
      </div>

      <SettingsForm
        initialAccent={toAccent(preferences?.defaultAccent ?? "AMERICAN")}
        initialSpeed={preferences?.defaultSpeed ?? 1}
      />
    </div>
  )
}