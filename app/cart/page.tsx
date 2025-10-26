"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store/cart-actions";
import { useAtom } from "jotai";
import { cartTotalAtom } from "@/lib/store/atoms";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const {
    cartItems,
    updateCartItemQuantity,
    removeFromCart,
    syncCartWithFirestore,
  } = useCart();

  const [cartTotal] = useAtom(cartTotalAtom);

  // Sync cart with Firestore on mount
  useEffect(() => {
    syncCartWithFirestore();
  }, [syncCartWithFirestore]);

  if (cartItems.length === 0) {
    return (
      <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <ShoppingBag
            className="w-16 h-16 text-muted-foreground"
            aria-hidden="true"
          />
          <h1 className="text-3xl font-bold">Your cart is empty</h1>
          <p className="text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
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
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="border rounded-lg bg-card">
            <div className="p-6">
              <div className="hidden pb-4 border-b md:grid md:grid-cols-12">
                <div className="md:col-span-6">
                  <span className="font-medium">Product</span>
                </div>
                <div className="text-center md:col-span-2">
                  <span className="font-medium">Price</span>
                </div>
                <div className="text-center md:col-span-2">
                  <span className="font-medium">Quantity</span>
                </div>
                <div className="text-right md:col-span-2">
                  <span className="font-medium">Total</span>
                </div>
              </div>

              <div className="divide-y">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.product_id}-${index}`}
                    className="py-4 md:grid md:grid-cols-12 md:items-center"
                  >
                    <div className="flex items-center space-x-4 md:col-span-6">
                      <div className="relative w-20 h-20 overflow-hidden rounded aspect-square min-w-fit">
                        <Image
                          src={
                            item.product.images?.[0]?.url ||
                            "/placeholder.svg?height=80&width=80"
                          }
                          alt={item.product.name}
                          fill
                          className="absolute object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          <Link
                            prefetch
                            href={`/products/${item.product.slug}`}
                            className="hover:underline"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        {item.attributes_selected &&
                          Object.keys(item.attributes_selected).length > 0 && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {Object.entries(item.attributes_selected)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 text-center md:col-span-2 md:mt-0">
                      <span className="text-sm font-medium md:text-base">
                        {/* Individual product prices remain consistent across all pages */}
                        {formatCurrency(item.price_at_add)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center mt-4 md:col-span-2 md:mt-0">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-r-none"
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                          <span className="sr-only">Remove one</span>
                        </Button>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateCartItemQuantity(
                              index,
                              Number.parseInt(e.target.value) || 1
                            )
                          }
                          className="w-12 h-8 p-0 text-center rounded-none border-x-0"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8 rounded-l-none"
                          onClick={() =>
                            updateCartItemQuantity(index, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                          <span className="sr-only">Add one</span>
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 md:col-span-2 md:mt-0 md:justify-end">
                      <span className="font-medium md:hidden">Total:</span>
                      <span className="font-medium">
                        {formatCurrency(item.price_at_add * item.quantity)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-4 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" asChild className="px-6">
              <Link prefetch href="/products">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="border rounded-lg bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-sm">Calculated at checkout</span>
                </div>

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>

                <Button
                  asChild
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  <Link prefetch href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>

                <div className="text-sm text-center text-muted-foreground">
                  Taxes and shipping calculated at checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
