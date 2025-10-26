"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Next.js Image component
import { Button } from "@/components/ui/button";
import type { ProductType } from "@/types/product";
import ProductCard from "@/components/product/product-card";
import { useWishlist } from "@/lib/store/wishlist-actions";
import { WishlistItem } from "../lib/store/atoms";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedProductsProps {
  products: ProductType[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [loading, setLoading] = useState(false); // Loading is handled in page.tsx now
  const [error, setError] = useState<string | null>(null); // Error is handled in page.tsx now
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
      <section className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Abayas</h2>
          <div className="select-none text-md text-muted-foreground opacity-60">
            View All
          </div>
        </div>
        <div className="relative">
          <div className="flex px-4 pb-4 -mx-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:mx-0 md:px-0">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center mr-2 last:mr-0"
              >
                <div className="w-full h-48 mb-4 bg-gray-200 rounded-lg aspect-square md:h-64 animate-pulse dark:bg-gray-800" />
                <div className="w-3/4 h-4 mx-auto mb-2 bg-gray-200 rounded animate-pulse dark:bg-gray-800" />
                <div className="w-1/2 h-4 mx-auto bg-gray-200 rounded animate-pulse dark:bg-gray-800" />
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
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-60"
              disabled
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>
    );
  if (error)
    return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!products.length) return null;

  return (
    <>
      <style jsx>{`
        @keyframes foldRightToLeft {
          0% {
            transform: scaleX(0) rotateY(90deg);
            transform-origin: left;
            opacity: 0;
          }
          15% {
            transform: scaleX(1) rotateY(0);
            transform-origin: left;
            opacity: 1;
          }
          85% {
            transform: scaleX(1) rotateY(0);
            transform-origin: left;
            opacity: 1;
          }
          100% {
            transform: scaleX(0) rotateY(-90deg);
            transform-origin: right;
            opacity: 0;
          }
        }
        @keyframes sparkle {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }
        .sparkle-icon {
          animation: sparkle 1.5s ease-in-out infinite;
          display: inline-block;
          margin-right: 4px;
        }
        .scarf-badge-container {
          position: absolute;
          bottom: 180px; /* Position for mobile devices */
          left: 0;
          right: auto;
          z-index: 20;
          perspective: 800px;
        }
        .scarf-badge {
          animation: foldRightToLeft 5s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          font-size: 9px;
          padding: 3px 6px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          background: linear-gradient(to right, #b870db, #9a5fff);
          transform-style: preserve-3d;
          display: inline-block;
          border-radius: 0 4px 4px 0;
        }
        .scarf-badge:hover {
          animation-play-state: paused;
        }
        @media (min-width: 640px) {
          .scarf-badge-container {
            bottom: 140px;
          }
          .scarf-badge {
            font-size: 10px;
            padding: 4px 8px;
          }
        }
        @media (min-width: 768px) {
          .scarf-badge-container {
            bottom: 170px; /* Position for larger devices */
          }
          .scarf-badge {
            font-size: 12px;
            padding: 6px 12px;
          }
        }
      `}</style>
      <section className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Abayas</h2>
          <Link
            prefetch
            href="/categories/abayas"
            className="text-md text-muted-foreground hover:underline"
          >
            View All
          </Link>
        </div>
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex px-4 pb-4 -mx-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4"
          >
            {products.map((product) => {
              // Check if product has hijab
              const hasHijab = (() => {
                if (!product) return false;
                const productString = JSON.stringify(product).toLowerCase();
                return productString.includes("hijab");
              })();

              return (
                <div
                  key={product.productId}
                  className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center mr-2 last:mr-0 relative product-card-wrapper"
                >
                  <ProductCard
                    product={product}
                    isInWishlist={wishlistItems.some(
                      (item: WishlistItem) =>
                        item.product_id === product.productId
                    )}
                    onAddToWishlist={() =>
                      product.productId &&
                      addToWishlist(product.productId!, product)
                    }
                    saleLabel={product.is_new_arrival ? "Save 5%" : "Exclusive Discount"}
                  />
                  {hasHijab && product.name !== "SunDusk Abaya" && (
                    <div className="scarf-badge-container">
                      <div className="font-bold text-white border-t border-b border-l shadow-md scarf-badge rounded-l-md border-white/40">
                        <span className="sparkle-icon">✨</span> Hijab Included
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("left")}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => scroll("right")}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
