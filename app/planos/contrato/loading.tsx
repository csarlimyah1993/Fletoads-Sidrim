import { Skeleton } from "@/components/ui/skeleton"

export default function ContratoLoading() {
  return (
    <div className="min-h-screen bg-muted">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>

          <div className="border rounded-lg p-6 bg-background">
            <div className="space-y-4 mb-6">
              <Skeleton className="h-7 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>

            <Skeleton className="h-96 w-full rounded-md" />

            <div className="flex justify-end my-6">
              <Skeleton className="h-9 w-36 rounded-md" />
            </div>

            <Skeleton className="h-1 w-full my-6" />

            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-64" />
            </div>

            <div className="flex justify-between mt-6">
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

