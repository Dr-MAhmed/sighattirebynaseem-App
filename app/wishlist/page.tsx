"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/lib/store/wishlist-actions";
import { useCart } from "@/lib/store/cart-actions";
import ProductCard from "@/components/product/product-card";

export default function WishlistPage() {
  const { syncWishlistWithFirestore, wishlistItems } = useWishlist();
  const { addToCart } = useCart();

  // Sync wishlist with Firestore on mount
  useEffect(() => {
    syncWishlistWithFirestore();
  }, [syncWishlistWithFirestore]);

  const handleAddToCart = (index: number) => {
    const item = wishlistItems[index];
    addToCart(item.product_id, item.product, 1);
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Heart className="w-16 h-16 text-primary/70" aria-hidden="true" />
          <h1 className="text-3xl font-bold">Your wishlist is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your wishlist yet.
          </p>
          <Button asChild className="mt-4">
            <Link prefetch href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <h1 className="mb-8 text-3xl font-bold">My Wishlist</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {wishlistItems.map((item, index) => (
          <div key={`${item.product_id}-${index}`} className="relative">
            <ProductCard product={item.product} />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => handleAddToCart(index)}
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
