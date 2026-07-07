import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="rounded-xl border p-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
        <Skeleton className="mt-6 h-10 w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
        <Skeleton className="mt-6 h-9 w-full" />
      </div>
    </div>
  )
}