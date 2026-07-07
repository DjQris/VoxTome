import { Skeleton } from "@/components/ui/skeleton"

export function ReaderSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-8rem)] flex-col gap-4 px-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>

      <div className="flex-1 rounded-2xl border p-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>

      <div className="border-t pt-4">
        <Skeleton className="h-1.5 w-full" />
        <div className="mt-4 flex justify-center gap-3">
          <Skeleton className="size-8 rounded-lg" />
          <Skeleton className="size-10 rounded-lg" />
          <Skeleton className="size-8 rounded-lg" />
        </div>
      </div>
    </div>
  )
}