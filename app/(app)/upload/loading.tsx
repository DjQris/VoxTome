import { Skeleton } from "@/components/ui/skeleton"

export default function UploadLoading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-72" />
      </div>
      <Skeleton className="min-h-56 w-full rounded-2xl" />
    </div>
  )
}