import { Suspense } from "react";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/firebase/firestore";
import { AbayasContent } from "./abayas-content";

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Server component for data fetching
async function AbayasPage() {
  try {
    const [categoryData, productsData] = await Promise.all([
      getCategoryBySlug("abayas"),
      getProductsByCategory("abayas", 100),
    ]);

    // Remove duplicate products based on productId
    const uniqueProducts = productsData?.filter((product, index, self) =>
      index === self.findIndex((p) => p.productId === product.productId)
    ) || [];

    return (
      <Suspense fallback={<LoadingFallback />}>
        <AbayasContent 
          initialCategory={categoryData} 
          initialProducts={uniqueProducts} 
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in AbayasPage:", error);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <AbayasContent 
          initialCategory={null} 
          initialProducts={[]} 
        />
      </Suspense>
    );
  }
}

export default AbayasPage;
