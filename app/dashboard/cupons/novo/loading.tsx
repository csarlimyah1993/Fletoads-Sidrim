import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Skeleton className="h-10 w-[200px]" />
      <div className="grid gap-4">
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  )
}
