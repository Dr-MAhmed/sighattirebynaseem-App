import { Skeleton } from "@/components/ui/skeleton"

export default function SizeGuideLoading() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <Skeleton className="mx-auto mb-4 h-10 w-48" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>

      <div className="space-y-8">
        {/* How to Measure Section */}
        <section>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <ul className="pl-5 space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <li key={i}>
                  <Skeleton className="h-4 w-3/4" />
                </li>
              ))}
            </ul>
            
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-md border p-4">
                  <Skeleton className="mb-2 h-6 w-1/3" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Size Chart Section */}
        <section>
          <Skeleton className="mb-6 h-8 w-64" />
          <div className="overflow-x-auto">
            <div className="w-full">
              <div className="mb-4 h-12 w-full bg-muted/50 rounded-md" />
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="mb-2 h-12 w-full border-b" />
              ))}
            </div>
          </div>
          <Skeleton className="mt-4 h-4 w-full" />
        </section>

        {/* Sleeve Length Chart Section */}
        <section>
          <Skeleton className="mb-6 h-8 w-56" />
          <div className="overflow-x-auto">
            <div className="w-full">
              <div className="mb-4 h-12 w-full bg-muted/50 rounded-md" />
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="mb-2 h-12 w-full border-b" />
              ))}
            </div>
          </div>
        </section>

        {/* International Size Conversion Section */}
        <section>
          <Skeleton className="mb-6 h-8 w-72" />
          <div className="overflow-x-auto">
            <div className="w-full">
              <div className="mb-4 h-12 w-full bg-muted/50 rounded-md" />
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="mb-2 h-12 w-full border-b" />
              ))}
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <div className="mt-12 pt-6 border-t">
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  )
} 