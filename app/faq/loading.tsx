import { Skeleton } from "@/components/ui/skeleton"

export default function FAQLoading() {
  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <Skeleton className="mx-auto mb-4 h-10 w-80" />
        <Skeleton className="mx-auto h-6 w-96" />
      </div>

      <div className="space-y-8">
        {[1, 2, 3, 4].map((section) => (
          <section key={section}>
            <Skeleton className="mb-6 h-8 w-48" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="rounded-md border p-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-4 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="mt-12 border-t pt-8 text-center">
          <Skeleton className="mx-auto mb-4 h-8 w-64" />
          <Skeleton className="mx-auto mb-6 h-6 w-80" />
          <Skeleton className="mx-auto h-10 w-32" />
        </div>
      </div>
    </div>
  )
} 