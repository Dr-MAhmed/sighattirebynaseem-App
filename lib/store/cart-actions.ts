"use client";

import { useAtom } from "jotai";
import { cartItemsAtom, cartOpenAtom, type CartItem } from "./atoms";
import { db } from "@/lib/firebase/config";
import { doc, setDoc, deleteDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/lib/firebase/auth-context";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { getProductBySlug } from "@/lib/firebase/firestore";
import type { ProductType } from "@/types/product";
import { validatePriceConsistency } from "@/lib/utils";

export function useCart() {
  const [cartItems, setCartItems] = useAtom(cartItemsAtom);
  const [isCartOpen, setIsCartOpen] = useAtom(cartOpenAtom);
  const { user } = useAuth();

  // Validation function to ensure price consistency
  const validateCartItemPrice = useCallback((item: CartItem, product: ProductType) => {
    const currentPrice = product.price; // Always use original price
    const storedPrice = item.price_at_add;
    
    // Use the utility function to validate and log any discrepancies
    return validatePriceConsistency(storedPrice, currentPrice, product.name);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, [setIsCartOpen]);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const addToCart = useCallback(
    async (
      product_id: string,
      product: ProductType,
      quantity = 1,
      attributes_selected?: Record<string, string>
    ) => {
      try {
        // Validate input
        if (!product_id || !product) {
          throw new Error("Invalid product data");
        }
        if (quantity < 1) {
          throw new Error("Quantity must be at least 1");
        }

        // Check stock availability
        const stockQuantity = product.stock_quantity || 0;
        if (stockQuantity <= 0) {
          throw new Error("This product is out of stock");
        }

        // Check if item already exists in cart
        const existingItemIndex = cartItems.findIndex(
          (item) =>
            item.product_id === product_id &&
            JSON.stringify(item.attributes_selected) ===
              JSON.stringify(attributes_selected)
        );

        let newCartItems = [...cartItems];
        let newQuantity = quantity;

        if (existingItemIndex > -1) {
          // Calculate new quantity
          newQuantity = newCartItems[existingItemIndex].quantity + quantity;

          // Check if new quantity exceeds stock
          if (newQuantity > stockQuantity) {
            // Set to max available stock and show warning
            newQuantity = stockQuantity;
            toast.warning(`Only ${stockQuantity} items available. We've updated your cart.`, {
              position: "top-center",
              autoClose: 3000,
            });
          }

          // Update quantity if item exists
          newCartItems[existingItemIndex] = {
            ...newCartItems[existingItemIndex],
            quantity: newQuantity,
            updated_at: new Date(),
          };
        } else {
          // For new items, check if requested quantity exceeds stock
          if (quantity > stockQuantity) {
            // Set to max available stock and show warning
            newQuantity = stockQuantity;
            toast.warning(`Only ${stockQuantity} items available. We've updated your cart.`, {
              position: "top-center",
              autoClose: 3000,
            });
          }

          // Add new item
          const newItem: CartItem = {
            product_id,
            product,
            quantity: newQuantity,
            price_at_add: product.price, // Always use original price for consistency
            attributes_selected,
            addedAt: new Date(),
            updated_at: new Date(),
          };
          newCartItems = [...newCartItems, newItem];
        }

        setCartItems(newCartItems);

        // Sync with Firestore if user is logged in
        if (user && db) {
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              const cartRef = doc(db, "carts", user.uid);
              await setDoc(cartRef, {
                user_id: user.uid,
                items: newCartItems.map((item) => ({
                  product_id: item.product_id,
                  quantity: item.quantity,
                  price_at_add: item.price_at_add,
                  attributes_selected: item.attributes_selected,
                  addedAt: item.addedAt,
                  updated_at: item.updated_at,
                })),
                updated_at: new Date(),
              });
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              if (retryCount === maxRetries) {
                console.error(
                  "Error syncing cart with Firestore after retries:",
                  error
                );
                throw error;
              }
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000)
              );
            }
          }
        }

        toast.success("Added to Cart Successfully", {
          position: "top-center",
          autoClose: 3000,
        });

        return newCartItems;
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "There was a problem adding this item to your cart.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return cartItems;
      }
    },
    [cartItems, setCartItems, user]
  );

  const updateCartItemQuantity = useCallback(
    async (index: number, quantity: number) => {
      if (quantity < 1) return cartItems;

      try {
        const item = cartItems[index];
        const stockQuantity = item.product.stock_quantity || 0;

        // Check if requested quantity exceeds stock
        let newQuantity = quantity;
        if (quantity > stockQuantity) {
          newQuantity = stockQuantity;
          toast.warning(`Only ${stockQuantity} items available. We've updated your cart.`, {
            position: "top-center",
            autoClose: 3000,
          });
        }

        const newCartItems = [...cartItems];
        newCartItems[index] = {
          ...newCartItems[index],
          quantity: newQuantity,
          updated_at: new Date(),
        };

        setCartItems(newCartItems);

        // Sync with Firestore if user is logged in
        if (user && db) {
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              const cartRef = doc(db, "carts", user.uid);
              await setDoc(cartRef, {
                user_id: user.uid,
                items: newCartItems.map((item) => ({
                  product_id: item.product_id,
                  quantity: item.quantity,
                  price_at_add: item.price_at_add,
                  attributes_selected: item.attributes_selected,
                  addedAt: item.addedAt,
                  updated_at: item.updated_at,
                })),
                updated_at: new Date(),
              });
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              if (retryCount === maxRetries) {
                console.error(
                  "Error syncing cart with Firestore after retries:",
                  error
                );
                throw error;
              }
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000)
              );
            }
          }
        }

        return newCartItems;
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "There was a problem updating your cart.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return cartItems;
      }
    },
    [cartItems, setCartItems, user]
  );

  const removeFromCart = useCallback(
    async (index: number) => {
      try {
        const newCartItems = [...cartItems];
        newCartItems.splice(index, 1);
        setCartItems(newCartItems);

        // Sync with Firestore if user is logged in
        if (user && db) {
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              const cartRef = doc(db, "carts", user.uid);
              if (newCartItems.length === 0) {
                await deleteDoc(cartRef);
              } else {
                await setDoc(cartRef, {
                  user_id: user.uid,
                  items: newCartItems.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price_at_add: item.price_at_add,
                    attributes_selected: item.attributes_selected,
                    addedAt: item.addedAt,
                    updated_at: item.updated_at,
                  })),
                  updated_at: new Date(),
                });
              }
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              if (retryCount === maxRetries) {
                console.error(
                  "Error syncing cart with Firestore after retries:",
                  error
                );
                throw error;
              }
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) =>
                setTimeout(resolve, Math.pow(2, retryCount) * 1000)
              );
            }
          }
        }

        toast.success("Item has been removed from your cart.", {
          position: "top-center",
          autoClose: 3000,
        });

        return newCartItems;
      } catch (error) {
        console.error("Error removing from cart:", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "There was a problem removing the item from your cart.",
          {
            position: "top-center",
            autoClose: 3000,
          }
        );
        return cartItems;
      }
    },
    [cartItems, setCartItems, user]
  );

  const clearCart = useCallback(async () => {
    try {
      setCartItems([]);

      // Sync with Firestore if user is logged in
      if (user && db) {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          try {
            const cartRef = doc(db, "carts", user.uid);
            await deleteDoc(cartRef);
            break; // Success, exit retry loop
          } catch (error) {
            retryCount++;
            if (retryCount === maxRetries) {
              console.error(
                "Error clearing cart in Firestore after retries:",
                error
              );
              throw error;
            }
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, Math.pow(2, retryCount) * 1000)
            );
          }
        }
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "There was a problem clearing your cart.",
        {
          position: "top-center",
          autoClose: 3000,
        }
      );
    }
  }, [setCartItems, user]);

  const syncCartWithFirestore = useCallback(async () => {
    if (!user || !db) return;

    try {
      // Get cart from Firestore
      const cartRef = doc(db, "carts", user.uid);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const firestoreCart = cartDoc.data();

        if (!firestoreCart.items || !Array.isArray(firestoreCart.items)) {
          console.warn("Invalid cart data structure in Firestore");
          return;
        }

        // Fetch full product data for each item
        const cartItemsWithProducts = await Promise.all(
          firestoreCart.items.map(async (item: any) => {
            try {
              if (!item.product_id) {
                console.warn("Cart item missing product_id:", item);
                return null;
              }

              // Fetch product by slug
              const product = await getProductBySlug(item.product_id);
              if (!product) {
                console.warn(`Product not found for slug: ${item.product_id}`);
                return null;
              }

              // Check if the product is in stock
              const stockQuantity = product.stock_quantity || 0;
              if (stockQuantity <= 0) {
                console.warn(
                  `Product ${item.product_id} is out of stock, removing from cart`
                );
                return null;
              }

              // Adjust quantity to not exceed stock
              let adjustedQuantity = item.quantity || 1;
              if (adjustedQuantity > stockQuantity) {
                console.warn(
                  `Adjusting cart item quantity from ${adjustedQuantity} to ${stockQuantity} due to stock limitations`
                );
                adjustedQuantity = stockQuantity;
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
                quantity: adjustedQuantity,
                price_at_add: validateCartItemPrice(item, product), // Use validation function
                attributes_selected: item.attributes_selected || {},
                addedAt: item.addedAt?.toDate
                  ? item.addedAt.toDate()
                  : new Date(item.addedAt),
                updated_at: item.updated_at?.toDate
                  ? item.updated_at.toDate()
                  : new Date(item.updated_at),
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

        // Filter out any null items (products that weren't found or are out of stock)
        const validCartItems = cartItemsWithProducts.filter(
          (item) => item !== null
        ) as CartItem[];

        // If quantities were adjusted, update the cart in Firestore
        const needsUpdate =
          validCartItems.length !== firestoreCart.items.length ||
          validCartItems.some(
            (item, index) =>
              item.quantity !== firestoreCart.items[index]?.quantity
          );

        if (needsUpdate) {
          // Update Firestore with adjusted quantities
          try {
            await setDoc(cartRef, {
              user_id: user.uid,
              items: validCartItems.map((item) => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_add: item.price_at_add,
                attributes_selected: item.attributes_selected,
                addedAt: item.addedAt,
                updated_at: new Date(),
              })),
              updated_at: new Date(),
            });

            if (validCartItems.length < firestoreCart.items.length) {
              toast.info("Some items were removed from your cart due to availability changes.", {
                position: "top-center",
                autoClose: 3000,
              });
            }
          } catch (updateError) {
            console.error(
              "Error updating cart with adjusted quantities:",
              updateError
            );
          }
        }

        setCartItems(validCartItems);
      } else {
        // If no cart exists, create an empty one
        await setDoc(cartRef, {
          user_id: user.uid,
          items: [],
          updated_at: new Date(),
        });
        setCartItems([]);
      }
    } catch (error) {
      console.error("Error syncing cart from Firestore:", error);
      // If there's a permissions error, try to create a new cart
      if (error instanceof Error && error.message.includes("permissions")) {
        try {
          const cartRef = doc(db, "carts", user.uid);
          await setDoc(cartRef, {
            user_id: user.uid,
            items: [],
            updated_at: new Date(),
          });
          setCartItems([]);
        } catch (createError) {
          console.error("Error creating new cart:", createError);
        }
      }
    }
  }, [user, setCartItems]);

  return {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    syncCartWithFirestore,
  };
}
