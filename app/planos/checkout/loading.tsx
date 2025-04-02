import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutLoading() {
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
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-5 w-64 mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="border rounded-lg p-6 bg-background">
                <div className="space-y-4 mb-6">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-5 w-72" />
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-16" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-full rounded-md" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>

            <div>
              <div className="border rounded-lg p-6 bg-background">
                <div className="space-y-4 mb-6">
                  <Skeleton className="h-7 w-36" />
                </div>
                <div className="space-y-4">
                  <div>
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24 mt-1" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                  <div>
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-6 w-28 mt-1" />
                  </div>
                  <Skeleton className="h-1 w-full" />
                  <div>
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-6 w-48 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

