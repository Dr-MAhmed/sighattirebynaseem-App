"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  getNewArrivals,
  getProductsByCategory,
} from "@/lib/firebase/firestore";
import ProductCard from "@/components/product/product-card";
import { ProductType } from "@/types/product";
import { useWishlist } from "@/lib/store/wishlist-actions";
import { WishlistItem } from "@/lib/store/atoms";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NewArrivalsProps {
  products: ProductType[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { wishlistItems, addToWishlist } = useWishlist();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.offsetWidth / 2; // Width of one item on mobile
      const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading)
    return (
      <section className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">New Arrivals</h2>
          <div className="text-md text-muted-foreground opacity-60 select-none">
            View All
          </div>
        </div>
        <div className="relative">
          <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center mr-2 last:mr-0"
              >
                <div className="aspect-square w-full h-48 md:h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 mb-4" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800 mb-2 mx-auto" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800 mx-auto" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-60"
              disabled
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-60"
              disabled
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </section>
    );
  if (error)
    return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!products.length) return null;

  return (
    <section className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">New Arrivals</h2>
        <Link
          prefetch
          href="/categories/new-arrivals"
          className="text-md text-muted-foreground hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4"
        >
          {products.map((product) => (
            <div
              key={product.productId}
              className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center mr-2 last:mr-0"
            >
              <ProductCard
                product={product}
                isInWishlist={wishlistItems.some(
                  (item: WishlistItem) => item.product_id === product.productId
                )}
                onAddToWishlist={() =>
                  addToWishlist(product.productId ?? "", product)
                }
                saleLabel="Save 5%"
                showHijabLabel={product.has_hijab === true}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
