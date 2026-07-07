"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ACCENTS, SPEED_OPTIONS, type Accent } from "@/lib/types"

type SettingsFormProps = {
  initialAccent: Accent
  initialSpeed: number
}

export function SettingsForm({
  initialAccent,
  initialSpeed,
}: SettingsFormProps) {
  const [accent, setAccent] = React.useState(initialAccent)
  const [speed, setSpeed] = React.useState(initialSpeed)
  const [isSaving, setIsSaving] = React.useState(false)

  const saveSettings = async () => {
    setIsSaving(true)

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultAccent: accent,
          defaultSpeed: speed,
        }),
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save settings")
      }

      toast.success("Settings saved")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Save failed"
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listening preferences</CardTitle>
        <CardDescription>
          These defaults apply to new books and sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Default accent</span>
          <select
            value={accent}
            onChange={(event) => setAccent(event.target.value as Accent)}
            className="h-10 rounded-lg border bg-background px-3"
          >
            {ACCENTS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.flag} {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm">
          <span className="font-medium">Default speed</span>
          <select
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            className="h-10 rounded-lg border bg-background px-3"
          >
            {SPEED_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value}x
              </option>
            ))}
          </select>
        </label>

        <Button onClick={() => void saveSettings()} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save preferences"}
        </Button>
      </CardContent>
    </Card>
  )
}