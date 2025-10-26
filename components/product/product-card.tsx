"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { ProductType } from "@/types/product";
import { useWishlist } from "@/lib/store/wishlist-actions";
import HijabLabel from "./hijab-label";
import styles from "./product-card.module.css";
import { useState, useEffect } from "react";
// import { readImage } from "./readImageUrl.action";

interface ProductCardProps {
  product: ProductType;
  isInWishlist?: boolean;
  onAddToWishlist?: () => void;
  saleLabel?: string;
  showHijabLabel?: boolean;
}

export default function ProductCard({
  product,
  isInWishlist,
  onAddToWishlist,
  saleLabel = "Save 5%",
  showHijabLabel = false,
}: ProductCardProps) {
  // Add state to force re-renders when discount expires
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute to check for expired discounts
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000); // Check every 10 seconds for immediate updates

    return () => clearInterval(interval);
  }, []);

  // Safely access product properties with fallbacks
  const name = product?.name || "Unnamed Product";
  const slug = product?.slug || "product";
  const productId = product?.productId || "";
  const price = product?.price || 0;
  const salePrice = product?.sale_price;
  const avgRating = product?.avg_rating || 0;
  const images = product?.images || [];
  const isNewArrival = product?.is_new_arrival || false;
  const isOutOfStock = !product?.stock_quantity || product.stock_quantity <= 0;

  // Check for hijab in all product fields
  const hasHijab = (() => {
    if (!product) return false;

    // Convert product to string and check for hijab
    const productString = JSON.stringify(product).toLowerCase();
    return productString.includes("hijab");
  })();

  const { wishlistItems, removeFromWishlist, addToWishlist } = useWishlist();

  // Helper function to get a valid image URL
  const getValidImageUrl = (url: string | undefined) => {
    if (!url || url.trim() === "" || url.includes("undefined")) {
      return "/placeholder.svg?height=400&width=400";
    }
    return url;
  };

  // Get the default image or the first image with a valid URL
  const validImages =
    images.filter(
      (img) =>
        img?.url && img.url.trim() !== "" && !img.url.includes("undefined")
    ) || [];
  const defaultImage =
    validImages.find((img) => img.is_default) || validImages[0];
  const imageUrl = defaultImage
    ? getValidImageUrl(defaultImage.url)
    : "/placeholder.svg?height=400&width=400";
  const imageAlt = defaultImage?.alt_text || name || "Product image";

  // Helper: check if discount/label is expired
  const isDiscountExpired = (() => {
    if (!product.discount_expiry) return false;
    
    try {
      const expiryDate = new Date(product.discount_expiry);
      
      // Check if expiry date is valid
      if (isNaN(expiryDate.getTime())) return false;
      
      // Return true if current time is past expiry time
      return currentTime > expiryDate;
    } catch (error) {
      console.error(`Error checking discount expiry for ${name}:`, error);
      return false;
    }
  })();

  const handleWishlistClick = () => {
    if (!productId) return; // Don't proceed if no product ID

    if (onAddToWishlist) {
      onAddToWishlist();
    } else {
      if (
        wishlistItems.some(
          (wishlistItem) => wishlistItem.product_id === productId
        )
      ) {
        removeFromWishlist(productId);
      } else {
        addToWishlist(productId, product);
      }
    }
  };

  return (
    <Card
      className={`overflow-hidden relative ${isOutOfStock ? "opacity-75" : ""}`}
    >
      <div className="relative">
        <Link
          prefetch
          href={`/products/${slug}`}
          className={isOutOfStock ? "pointer-events-none" : ""}
        >
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={imageAlt}
            width={400}
            height={500}
            className={`w-full object-cover transition-transform duration-300 ${
              isOutOfStock ? "" : "hover:scale-105"
            }`}
            style={{ aspectRatio: "4/5" }}
          />
        </Link>
        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="transform rotate-[-15deg] bg-red-600 px-6 py-2 text-lg font-bold text-white shadow-lg">
              Out of Stock
            </div>
          </div>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className={`absolute right-2 bottom-2 rounded-full bg-white/80 hover:bg-white dark:bg-gray-900/80 dark:hover:bg-gray-900 ${
            isInWishlist ? "text-primary" : ""
          }`}
          onClick={handleWishlistClick}
        >
          <Heart
            className="h-5 w-5"
            fill={isInWishlist ? "currentColor" : "none"}
          />
          <span className="sr-only">Add to wishlist</span>
        </Button>
        {!isDiscountExpired && product.save_percent !== null && product.save_percent !== undefined && product.save_percent > 0 ? (
          <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
            Save {product.save_percent}%
          </div>
        ) : !isDiscountExpired && salePrice && salePrice > 0 && salePrice !== null && salePrice !== undefined ? (
          <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white">
            {saleLabel}
          </div>
        ) : null}
        {isNewArrival ? (
          <div className="absolute right-2 top-2 rounded-full bg-purple-500 px-2 py-1 text-xs font-medium text-white">
            New Arrival
          </div>
        ) : null}
        {!isDiscountExpired && product.is_exclusive_discount ? (
          <div className="absolute left-2 top-2 rounded-full bg-primary px-2 py-1 text-xs font-medium text-white z-20">
            Exclusive Discount
          </div>
        ) : null}
        {showHijabLabel && hasHijab && name !== "SunDusk Abaya" && name !== "Linaah Abaya" ? (
          <div className="absolute left-0 bottom-1 z-20 perspective-800">
            <div className={styles.hijabLabel}>
              <span className={styles.sparkleIcon}>✨</span> Hijab Included
            </div>
          </div>
        ) : null}
      </div>
      <CardContent className="p-4">
        <Link prefetch href={`/products/${slug}`} className="hover:underline">
          <h3 className="font-medium">{name}</h3>
        </Link>
        <div className="mt-1 flex items-center">
          {!isDiscountExpired && salePrice && salePrice > 0 && salePrice !== null && salePrice !== undefined ? (
            <>
              {/* Show original price with strikethrough */}
              <span className="font-medium text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
              {/* Show sale price prominently */}
              <span className="ml-2 font-medium text-primary">
                {formatCurrency(salePrice)}
              </span>
            </>
          ) : (
            <span className="font-medium text-primary">{formatCurrency(price)}</span>
          )}
        </div>
        <div className="mt-1 flex items-center">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(avgRating)
                    ? "text-yellow-400"
                    : i < avgRating
                    ? "text-yellow-400"
                    : "text-muted"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-muted-foreground">
            {avgRating.toFixed(1) || "0.0"} ({product.review_count || 0} reviews)
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className={`w-full ${
            isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isOutOfStock}
        >
          <Link prefetch href={`/products/${slug}`}>
            View Details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}