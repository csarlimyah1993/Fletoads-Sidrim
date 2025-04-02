import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="flex flex-wrap gap-2">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
        </div>
      </div>

      <Skeleton className="h-8 w-48 mb-6" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array(12)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="border rounded-b-lg p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

