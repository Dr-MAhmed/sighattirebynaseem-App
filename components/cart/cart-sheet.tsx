"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store/cart-actions";
import { useAtom } from "jotai";
import { cartItemCountAtom, cartTotalAtom } from "@/lib/store/atoms";
import { formatCurrency } from "@/lib/utils";

export function CartSheet() {
  const {
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    updateCartItemQuantity,
    removeFromCart,
    syncCartWithFirestore,
  } = useCart();

  const [cartItemCount] = useAtom(cartItemCountAtom);
  const [cartTotal] = useAtom(cartTotalAtom);

  // Sync cart with Firestore on mount
  useEffect(() => {
    syncCartWithFirestore();
  }, [syncCartWithFirestore]);

  return (
    <Sheet
      open={isCartOpen}
      onOpenChange={(open) => (open ? openCart() : closeCart())}
    >
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="space-y-2.5 pr-6">
          <SheetTitle>Shopping Cart ({cartItemCount})</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <div className="flex flex-1 flex-col gap-5 overflow-auto py-6">
              <div className="grid grid-cols-12 border-b pb-2">
                <div className="col-span-6">
                  <span className="text-sm font-medium">Product</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">Price</span>
                </div>
                <div className="col-span-2 text-center">
                  <span className="text-sm font-medium">Qty</span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-medium">Total</span>
                </div>
              </div>

              {cartItems.map((item, index) => (
                <div
                  key={`${item.product_id}-${index}`}
                  className="grid grid-cols-12 items-center gap-2 border-b pb-4"
                >
                  <div className="col-span-6 flex items-center space-x-2">
                    <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded">
                      <Image
                        src={
                          item.product.images?.[0]?.url ||
                          "/placeholder.svg?height=64&width=64"
                        }
                        alt={item.product.name}
                        fill
                        className="absolute object-cover"
                      />
                    </div>
                    <div className="flex flex-col self-start">
                      <span className="line-clamp-1 text-sm font-medium">
                        {item.product.name}
                      </span>
                      {item.attributes_selected &&
                        Object.keys(item.attributes_selected).length > 0 && (
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {Object.entries(item.attributes_selected)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(", ")}
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="col-span-2 text-center">
                    <span className="text-xs">
                      {formatCurrency(item.price_at_add)}
                    </span>
                  </div>

                  <div className="col-span-2 flex items-center justify-center">
                    <div className="flex items-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-r-none"
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-2 w-2" />
                        <span className="sr-only">Remove one</span>
                      </Button>
                      <div className="flex h-6 w-6 items-center justify-center border border-l-0 border-r-0 border-input text-xs">
                        {item.quantity}
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-l-none"
                        onClick={() =>
                          updateCartItemQuantity(index, item.quantity + 1)
                        }
                      >
                        <Plus className="h-2 w-2" />
                        <span className="sr-only">Add one</span>
                      </Button>
                    </div>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-1">
                    <span className="text-xs font-medium">
                      {formatCurrency(item.price_at_add * item.quantity)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                      <span className="sr-only">Remove item</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-muted-foreground">
                    Calculated at checkout
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>
              <SheetFooter className="flex flex-col gap-2 sm:flex-col">
                <Button
                  asChild
                  size="sm"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link prefetch href="/checkout" onClick={closeCart}>
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={closeCart}
                >
                  <Link prefetch href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </SheetFooter>
              <div className="text-center text-xs text-muted-foreground">
                Taxes and shipping calculated at checkout
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-2">
            <ShoppingBag
              className="h-12 w-12 text-primary/60"
              aria-hidden="true"
            />
            <div className="text-xl font-medium">Your cart is empty</div>
            <div className="text-center text-sm text-muted-foreground">
              Add items to your cart to checkout
            </div>
            <Button
              asChild
              variant="outline"
              className="mt-6"
              onClick={closeCart}
            >
              <Link prefetch href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
