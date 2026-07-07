"use client"

import * as React from "react"

export function useWakeLock(enabled: boolean) {
  const lockRef = React.useRef<WakeLockSentinel | null>(null)

  React.useEffect(() => {
    if (!enabled || !("wakeLock" in navigator)) {
      return
    }

    let cancelled = false

    async function acquireLock() {
      try {
        if (cancelled || lockRef.current) {
          return
        }

        lockRef.current = await navigator.wakeLock.request("screen")
      } catch {
        // Wake lock may be denied; playback still works
      }
    }

    void acquireLock()

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled) {
        void acquireLock()
      }
    }

    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibilityChange)
      void lockRef.current?.release()
      lockRef.current = null
    }
  }, [enabled])
}