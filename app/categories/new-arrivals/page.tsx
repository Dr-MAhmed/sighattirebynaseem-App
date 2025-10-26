"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
import { getCategoryBySlug, getNewArrivals } from "@/lib/firebase/firestore";
import { useWishlist } from "@/lib/store/wishlist-actions";
import ProductCard from "@/components/product/product-card";
import type { ProductType } from "@/types/product";
import type { CategoryType } from "@/types/category";
import CategoryHeader from "@/components/category/category-header";
import { useFilteredProducts } from "@/lib/hooks/use-filtered-products";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { getProductsByCategory } from "@/lib/firebase/firestore";

// Helper function to convert Firestore document to ProductType
const convertToProductType = (doc: any): ProductType => {
  const data = doc.data();
  return {
    productId: doc.id,
    name: data.name || "",
    slug: data.slug || "",
    price: data.price || 0,
    sale_price: data.sale_price,
    description: data.description,
    images: data.images || [],
    avg_rating: data.avg_rating,
    review_count: data.review_count,
    attributes: data.attributes || {},
    variants: data.variants || [],
    has_variants: data.has_variants || false,
    stock_quantity: data.stock_quantity,
    category_id: data.category_id,
    is_featured: data.is_featured || false,
    is_active: data.is_active ?? true,
    is_new_arrival: data.is_new_arrival || false,
    is_best_seller: data.is_best_seller || false,
    has_hijab: data.has_hijab || false,
    sku: data.sku,
    sales_count: data.sales_count,
    created_at: data.created_at?.toDate(),
    updated_at: data.updated_at?.toDate(),
  };
};

// Loading fallback for Suspense
function LoadingFallback() {
  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function NewArrivalsContent() {
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductType[]>([]);
  const { wishlistItems, addToWishlist } = useWishlist();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const {
    filteredProducts = [],
    priceRange,
    setPriceRange,
    selectedAttributes,
    handleAttributeChange,
    sortOption,
    setSortOption,
    allAttributes,
    resetFilters,
  } = useFilteredProducts(products || []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get category data
        const categoryData = await getCategoryBySlug("new-arrivals");
        if (categoryData) {
          setCategory(categoryData);
        }

        // Get products from both sources
        const [categoryProducts, newArrivalProducts] = await Promise.all([
          categoryData?.slug ? getProductsByCategory(categoryData.slug) : [],
          (async () => {
            const productsRef = collection(db, "products");
            const q = query(
              productsRef,
              where("is_new_arrival", "==", true),
              where("is_active", "==", true)
            );
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(convertToProductType);
          })()
        ]);

        // Combine products and remove duplicates
        const allProducts = new Set();
        const combinedProducts: ProductType[] = [];

        [...categoryProducts, ...newArrivalProducts].forEach(product => {
          if (!allProducts.has(product.productId)) {
            allProducts.add(product.productId);
            combinedProducts.push(product);
          }
        });

        setProducts(combinedProducts);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToWishlist = (product: ProductType) => {
    if (!product.productId) return;
    addToWishlist(product.productId!, product);
  };

  // if (loading) {
  //   return (
  //     <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
  //       <div className="flex justify-center">
  //         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <CategoryHeader
        title={category?.name || "New Arrivals"}
        description={
          category?.description ||
          "Our latest collection of abayas and modest clothing. Be the first to explore our newest designs."
        }
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Filters - Desktop */}
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="rounded-lg border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium">Filters</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={resetFilters}
              >
                Reset
              </Button>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="mb-4 text-sm font-medium">Price Range</h3>
                <Slider
                  value={priceRange}
                  min={0}
                  max={10000}
                  step={100}
                  onValueChange={setPriceRange}
                  className="py-4"
                />
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span>Rs. {priceRange[0]}</span>
                  <span>Rs. {priceRange[1]}</span>
                </div>
              </div>
              <Separator />
              {Object.entries(allAttributes).map(([attributeName, values]) => (
                <div key={attributeName}>
                  <h3 className="mb-4 text-sm font-medium">{attributeName}</h3>
                  <div className="space-y-2">
                    {values.map((value) => (
                      <div key={value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${attributeName}-${value}`}
                          checked={
                            selectedAttributes[attributeName]?.includes(
                              value
                            ) || false
                          }
                          onCheckedChange={(checked) =>
                            handleAttributeChange(
                              attributeName,
                              value,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`${attributeName}-${value}`}
                          className="text-sm"
                        >
                          {value}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={setPriceRange}
                  />
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>
                <Separator />
                {Object.entries(allAttributes).map(
                  ([attributeName, values]) => (
                    <div key={attributeName}>
                      <h3 className="mb-4 text-sm font-medium">
                        {attributeName}
                      </h3>
                      <div className="space-y-2">
                        {values.map((value) => (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`mobile-${attributeName}-${value}`}
                              checked={
                                selectedAttributes[attributeName]?.includes(
                                  value
                                ) || false
                              }
                              onCheckedChange={(checked) =>
                                handleAttributeChange(
                                  attributeName,
                                  value,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`mobile-${attributeName}-${value}`}
                              className="text-sm"
                            >
                              {value}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  )
                )}
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetFilters}>
                    Reset
                  </Button>
                  <Button>Apply Filters</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1">
          {/* Sort and Results Count */}
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm text-muted-foreground">
              Showing {filteredProducts.length} of {products.length} products
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Sort by:</span>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low-high">
                    Price: Low to High
                  </SelectItem>
                  <SelectItem value="price-high-low">
                    Price: High to Low
                  </SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="space-y-4">
                  <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <h2 className="text-xl font-medium">No products found</h2>
              <p className="mt-2 text-muted-foreground">
                Try adjusting your filters to find what you're looking for.
              </p>
              <Button className="mt-4" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.productId}
                  product={product}
                  isInWishlist={wishlistItems.some(
                    (wishlistItem) =>
                      wishlistItem.product_id === product.productId
                  )}
                  onAddToWishlist={() => handleAddToWishlist(product)}
                  showHijabLabel={product.has_hijab || false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// Main page component with Suspense
export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <NewArrivalsContent />
    </Suspense>
  );
}
