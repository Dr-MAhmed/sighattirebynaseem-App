"use client";

import { useAtom } from "jotai";
import { wishlistItemsAtom, type WishlistItem } from "./atoms";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import { useCallback } from "react";
import { toast } from "@/components/ui/use-toast";
import { getProductBySlug } from "@/lib/firebase/firestore";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useAtom(wishlistItemsAtom);
  const { user } = useAuth();

  const addToWishlist = useCallback(
    async (product_id: string, product: any) => {
      // Check if item already exists in wishlist
      const existingItem = wishlistItems.find(
        (item) => item.product_id === product_id
      );

      if (existingItem) {
        toast({
          title: "Already in wishlist",
          description: `${product.name} is already in your wishlist.`,
        });
        return wishlistItems;
      }

      const newItem: WishlistItem = {
        product_id,
        product,
        addedAt: new Date(),
      };

      const newWishlistItems = [...wishlistItems, newItem];
      setWishlistItems(newWishlistItems);

      // Sync with Firestore if user is logged in
      if (user && db) {
        try {
          const wishlistRef = doc(db, "wishlists", user.uid);
          await setDoc(wishlistRef, {
            user_id: user.uid,
            items: newWishlistItems.map((item) => ({
              product_id: item.product_id,
              addedAt: item.addedAt,
            })),
            updated_at: new Date(),
          });
        } catch (error) {
          console.error("Error syncing wishlist with Firestore:", error);
        }
      }

      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });

      return newWishlistItems;
    },
    [wishlistItems, setWishlistItems, user]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const index = wishlistItems.findIndex(
        (item) => item.product_id === productId
      );
      const itemToRemove = wishlistItems[index];
      const newWishlistItems = [...wishlistItems];
      newWishlistItems.splice(index, 1);
      setWishlistItems(newWishlistItems);

      // Sync with Firestore if user is logged in
      if (user && db) {
        try {
          const wishlistRef = doc(db, "wishlists", user.uid);
          if (newWishlistItems.length === 0) {
            await deleteDoc(wishlistRef);
          } else {
            await setDoc(wishlistRef, {
              user_id: user.uid,
              items: newWishlistItems.map((item) => ({
                product_id: item.product_id,
                addedAt: item.addedAt,
              })),
              updated_at: new Date(),
            });
          }
        } catch (error) {
          console.error("Error syncing wishlist with Firestore:", error);
        }
      }

      toast({
        title: "Removed from wishlist",
        description: `${itemToRemove.product.name} has been removed from your wishlist.`,
      });

      return newWishlistItems;
    },
    [wishlistItems, setWishlistItems, user]
  );

  const clearWishlist = useCallback(async () => {
    setWishlistItems([]);

    // Sync with Firestore if user is logged in
    if (user && db) {
      try {
        const wishlistRef = doc(db, "wishlists", user.uid);
        await deleteDoc(wishlistRef);
      } catch (error) {
        console.error("Error clearing wishlist in Firestore:", error);
      }
    }
  }, [setWishlistItems, user]);

  const syncWishlistWithFirestore = useCallback(async () => {
    if (!user || !db) return;

    try {
      // Get wishlist from Firestore
      const wishlistRef = doc(db, "wishlists", user.uid);
      const wishlistDoc = await getDoc(wishlistRef);

      if (wishlistDoc.exists()) {
        const firestoreWishlist = wishlistDoc.data();

        // Fetch full product data for each item
        const wishlistItemsWithProducts = await Promise.all(
          firestoreWishlist.items.map(async (item: any) => {
            try {
              // Fetch product by slug
              const product = await getProductBySlug(item.product_id);
              if (!product) {
                console.warn(`Product not found for slug: ${item.product_id}`);
                return null;
              }

              // Ensure all required fields are present
              return {
                product_id: item.product_id,
                product: {
                  ...product,
                  productId: product.productId || item.product_id,
                  name: product.name || "",
                  slug: product.slug || item.product_id,
                  price: product.price || 0,
                  sale_price: product.sale_price,
                  description: product.description || "",
                  images: product.images || [],
                  category: product.category || "",
                  category_slug: product.category_slug || "",
                  stock_quantity: product.stock_quantity || 0,
                  attributes: product.attributes || {},
                  is_featured: product.is_featured || false,
                  is_new_arrival: product.is_new_arrival || false,
                  is_best_seller: product.is_best_seller || false,
                  created_at: product.created_at || new Date().toISOString(),
                  updated_at: product.updated_at || new Date().toISOString(),
                },
                addedAt: item.addedAt?.toDate
                  ? item.addedAt.toDate()
                  : new Date(item.addedAt),
              };
            } catch (error) {
              console.error(
                `Error fetching product ${item.product_id}:`,
                error
              );
              return null;
            }
          })
        );

        // Filter out any null items (products that weren't found)
        const validWishlistItems = wishlistItemsWithProducts.filter(
          (item): item is WishlistItem => item !== null
        );
        setWishlistItems(validWishlistItems);
      }
    } catch (error) {
      console.error("Error syncing wishlist from Firestore:", error);
    }
  }, [user, setWishlistItems]);

  return {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    syncWishlistWithFirestore,
  };
}
