import { SpinnerIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

type ReaderLoadingOverlayProps = {
  visible: boolean
  label?: string
}

export function ReaderLoadingOverlay({
  visible,
  label = "Preparing audio...",
}: ReaderLoadingOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-background/60 backdrop-blur-[2px] transition-opacity duration-300",
        visible ? "opacity-100" : "opacity-0"
      )}
      aria-hidden={!visible}
    >
      <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-sm">
        <SpinnerIcon className="size-4 animate-spin text-primary" />
        {label}
      </div>
    </div>
  )
}