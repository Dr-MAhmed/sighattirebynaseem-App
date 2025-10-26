import { Suspense } from "react";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCategoryBySlug,
  getProductsByCategory,
} from "@/lib/firebase/firestore";
import { useWishlist } from "@/lib/store/wishlist-actions";
import ProductCard from "@/components/product/product-card";
import type { ProductType } from "@/types/product";
import type { CategoryType } from "@/types/category";
import CategoryHeader from "@/components/category/category-header";
import { useFilteredProducts } from "@/lib/hooks/use-filtered-products";
import { HijabsContent } from "./hijabs-content";

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="w-full bg-gray-200 rounded-lg aspect-square animate-pulse dark:bg-gray-800" />
            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800" />
            <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Server component for data fetching
async function HijabsPage() {
  try {
    const [categoryData, productsData] = await Promise.all([
      getCategoryBySlug("hijabs"),
      getProductsByCategory("hijabs", 100),
    ]);

    return (
      <Suspense fallback={<LoadingFallback />}>
        <HijabsContent 
          initialCategory={categoryData} 
          initialProducts={productsData || []} 
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in HijabsPage:", error);
    return (
      <Suspense fallback={<LoadingFallback />}>
        <HijabsContent 
          initialCategory={null} 
          initialProducts={[]} 
        />
      </Suspense>
    );
  }
}

export default HijabsPage;
