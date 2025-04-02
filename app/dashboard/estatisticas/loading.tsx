import { Skeleton } from "@/components/ui/skeleton"

export default function EstatisticasLoading() {
  return (
    <div className="container mx-auto py-10">
      <Skeleton className="h-10 w-[250px] mb-6" />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-80 w-full rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  )
}
