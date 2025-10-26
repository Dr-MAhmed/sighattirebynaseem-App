"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !db || !id) return;

      try {
        const orderDoc = await getDoc(doc(db, "orders", id as string));

        if (!orderDoc.exists()) {
          router.push("/account/orders");
          return;
        }

        const orderData = orderDoc.data();

        // Check if order belongs to current user
        if (orderData.user_id !== user.uid) {
          router.push("/account/orders");
          return;
        }

        setOrder({
          id: orderDoc.id,
          ...orderData,
          order_date: orderData.order_date?.toDate
            ? orderData.order_date.toDate()
            : new Date(orderData.order_date),
        });
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrder();
    }
  }, [user, id, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending Advance":
        return "bg-amber-500";
      case "Processing":
        return "bg-blue-500";
      case "Shipped":
        return "bg-purple-500";
      case "Delivered":
        return "bg-green-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading || isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user || !order) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link prefetch href="/account/orders">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
          <Badge className={getStatusColor(order.order_status)}>
            {order.order_status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Placed on {order.order_date.toLocaleDateString()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Order Items</h2>

              <div className="divide-y">
                {order.items.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="py-4 md:grid md:grid-cols-4 md:items-center"
                  >
                    <div className="flex items-center space-x-4 md:col-span-2">
                      <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded bg-gray-100 dark:bg-gray-800">
                        {/* Placeholder for product image */}
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.attributes_selected &&
                          Object.keys(item.attributes_selected).length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {Object.entries(item.attributes_selected)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join(", ")}
                            </p>
                          )}
                      </div>
                    </div>

                    <div className="mt-4 text-center md:col-span-1 md:mt-0">
                      <span className="text-sm font-medium md:text-base">
                        {formatCurrency(item.price_per_item)} × {item.quantity}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between md:col-span-1 md:mt-0 md:justify-end">
                      <span className="font-medium md:hidden">Total:</span>
                      <span className="font-medium">
                        {formatCurrency(item.price_per_item * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {order.tracking_number && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium">Tracking Information</h2>
              <p className="font-medium">
                Tracking Number: {order.tracking_number}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                You can track your package using this tracking number.
              </p>
            </div>
          )}

          {order.order_notes && (
            <div className="mt-6 rounded-lg border bg-card p-6">
              <h2 className="mb-4 text-lg font-medium">Order Notes</h2>
              <p>{order.order_notes}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{formatCurrency(order.shipping_cost || 0)}</span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span>Advance Payment (20%)</span>
                  <span>{formatCurrency(order.advance_payment_required)}</span>
                </div>

                <div className="rounded-lg bg-muted p-4">
                  <h3 className="mb-2 font-medium">Payment Information</h3>
                  <p className="text-sm">
                    Method:{" "}
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : order.payment_method}
                  </p>
                  <p className="mt-1 text-sm">
                    Advance Payment Status:{" "}
                    <span className="font-medium">
                      {order.advance_payment_status}
                    </span>
                  </p>

                  {order.advance_payment_screenshot_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      asChild
                    >
                      <a
                        href={order.advance_payment_screenshot_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        View Payment Receipt
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Shipping Address</h2>

              <div className="text-sm">
                <p className="font-medium">{order.shipping_address.name}</p>
                <p>{order.shipping_address.street}</p>
                <p>
                  {order.shipping_address.city},{" "}
                  {order.shipping_address.province}
                </p>
                <p className="mt-2">Phone: {order.shipping_address.phone}</p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <Button variant="outline" className="w-full" asChild>
              <Link prefetch href="/contact">
                Need Help? Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
