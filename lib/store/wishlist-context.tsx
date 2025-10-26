"use client";

import { createContext, useContext } from "react";
import { useWishlist } from "./wishlist-actions";

const WishlistContext = createContext<ReturnType<typeof useWishlist> | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const wishlist = useWishlist();
  return <WishlistContext.Provider value={wishlist}>{children}</WishlistContext.Provider>;
}

export function useWishlistContext() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within a WishlistProvider");
  }
  return context;
} 