import { Suspense } from "react";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/firebase/firestore";
import { PrayerNamazChadarContent } from "./prayer-namaz-chadar-content";

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
async function PrayerNamazChadarPage() {
  try {
    const [categoryData, productsData] = await Promise.all([
      getCategoryBySlug("prayer-namaz-chadar"),
      getProductsByCategory("prayer-namaz-chadar", 100),
    ]);

    return (
      <Suspense fallback={<LoadingFallback />}>
        <PrayerNamazChadarContent 
          initialCategory={categoryData} 
          initialProducts={productsData || []} 
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in PrayerNamazChadarPage:", error);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <PrayerNamazChadarContent 
          initialCategory={null} 
          initialProducts={[]} 
        />
      </Suspense>
    );
  }
}

export default PrayerNamazChadarPage;
