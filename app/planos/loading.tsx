import { Skeleton } from "@/components/ui/skeleton"

export default function PlanosLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-14" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-16 rounded-md" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="py-20 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Skeleton className="h-12 w-3/4 max-w-[600px]" />
              <Skeleton className="h-6 w-full max-w-[800px]" />
            </div>

            {/* Tabs Skeleton */}
            <div className="flex justify-center mb-12">
              <Skeleton className="h-10 w-[400px] rounded-md" />
            </div>

            {/* Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <Skeleton key={index} className="h-[400px] rounded-lg" />
                ))}
            </div>
          </div>
        </section>

        {/* Benefícios Section Skeleton */}
        <section className="py-20 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Skeleton className="h-10 w-1/2 max-w-[400px]" />
              <Skeleton className="h-6 w-full max-w-[800px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {Array(4)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="flex flex-col items-center text-center space-y-3">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Depoimentos Section Skeleton */}
        <section className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Skeleton className="h-10 w-1/2 max-w-[400px]" />
              <Skeleton className="h-6 w-full max-w-[800px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} className="p-6 border rounded-lg">
                    <div className="flex flex-col space-y-4">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-14 w-14 rounded-full" />
                        <div>
                          <Skeleton className="h-5 w-32" />
                          <Skeleton className="h-4 w-24 mt-2" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

