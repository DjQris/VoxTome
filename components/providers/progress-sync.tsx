"use client"

import * as React from "react"

import { flushProgressQueue } from "@/lib/progress-queue"

export function ProgressSync() {
  React.useEffect(() => {
    void flushProgressQueue()

    const onOnline = () => {
      void flushProgressQueue()
    }

    window.addEventListener("online", onOnline)

    return () => {
      window.removeEventListener("online", onOnline)
    }
  }, [])

  return null
}