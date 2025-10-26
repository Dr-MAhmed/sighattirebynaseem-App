import { Suspense } from "react";
import { getCategoryBySlug, getProductsBySubCategory } from "@/lib/firebase/firestore";
import { FormalContent } from "./formal-content";

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="mb-6 h-4 w-48 animate-pulse rounded bg-muted" />
      <div className="mb-8 space-y-4">
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-square animate-pulse rounded-lg bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main page component with Suspense
export default async function FormalPage() {
  try {
    const [category, products] = await Promise.all([
      getCategoryBySlug("formal"),
      getProductsBySubCategory("abayas", "formal"),
    ]);

    return (
      <Suspense fallback={<LoadingFallback />}>
        <FormalContent
          initialCategory={category}
          initialProducts={products}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error loading Formal page:", error);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <FormalContent initialCategory={null} initialProducts={[]} />
      </Suspense>
    );
  }
}
