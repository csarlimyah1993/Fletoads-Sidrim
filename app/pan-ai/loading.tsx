import { Skeleton } from "@/components/ui/skeleton"

export default function PanAILoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-full max-w-md" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <Skeleton className="h-[600px] w-full" />
        </div>
        <div className="lg:col-span-5">
          <Skeleton className="h-[600px] w-full" />
        </div>
        <div className="lg:col-span-4">
          <Skeleton className="h-[200px] w-full mb-4" />
          <Skeleton className="h-[200px] w-full mb-4" />
          <Skeleton className="h-[160px] w-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  )
}

