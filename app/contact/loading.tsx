import { Skeleton } from "@/components/ui/skeleton"

export default function ContactLoading() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto mb-4 h-10 w-64" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <Skeleton className="mb-2 h-6 w-32" />
                <Skeleton className="h-5 w-full" />
                {i === 4 && (
                  <>
                    <Skeleton className="mt-1 h-5 w-full" />
                    <Skeleton className="mt-1 h-5 w-full" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <Skeleton className="mb-6 h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className={`h-${i === 4 ? 32 : 10} w-full`} />
              </div>
            ))}
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
} 