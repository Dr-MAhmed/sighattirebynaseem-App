"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import {
  decreaseProductStock,
  updateProductStock,
} from "@/lib/firebase/product-stock";

interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  price_per_item: number;
  attributes_selected: Record<string, string>;
  product: {
    images?: Array<{
      url: string;
      alt_text?: string;
    }>;
  };
}

interface Order {
  id: string;
  order_number: string;
  order_date: any;
  total_amount: number;
  order_status: string;
  items: OrderItem[];
  payment_screenshot_base64?: string;
  advance_payment_status: string;
  user_id: string;
  email: string;
  shipping_address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
  };
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  advance_payment_required: number;
  order_notes?: string | null;
  tracking_number?: string;
}

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const orderDoc = await getDoc(doc(db, "orders", id as string));

        if (!orderDoc.exists()) {
          router.push("/admin/orders");
          return;
        }

        const orderData = orderDoc.data();
        setOrder({
          id: orderDoc.id,
          ...orderData,
          order_date: orderData.order_date?.toDate
            ? orderData.order_date.toDate()
            : new Date(orderData.order_date),
        } as Order);
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Failed to fetch order details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id, router]);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const updateData: {
        order_status: string;
        updated_at: Date;
        order_notes?: string;
      } = {
        order_status: newStatus,
        updated_at: new Date(),
      };

      // Only include order_notes if it exists
      if (order.order_notes) {
        updateData.order_notes = order.order_notes;
      }

      await updateDoc(doc(db, "orders", order.id), updateData);

      // Handle product stock updates based on status change
      try {
        // If changing from a non-cancelled status to cancelled, restore the product quantities
        if (order.order_status !== "Cancelled" && newStatus === "Cancelled") {
          // For each item in the order, restore the stock
          await Promise.all(
            order.items.map(async (item) => {
              // Get current product data to update the stock
              const productRef = doc(db, "products", item.product_id);
              const productDoc = await getDoc(productRef);

              if (productDoc.exists()) {
                const productData = productDoc.data();
                const currentStock = productData.stock_quantity || 0;

                // Add the quantity back to stock
                await updateProductStock(
                  item.product_id,
                  currentStock + item.quantity
                );
              }
            })
          );
        }
        // If changing from cancelled to another status, decrease the stock again
        else if (
          order.order_status === "Cancelled" &&
          newStatus !== "Cancelled"
        ) {
          // For each item in the order, decrease the stock
          await Promise.all(
            order.items.map(async (item) => {
              await decreaseProductStock(item.product_id, item.quantity);
            })
          );
        }
      } catch (error) {
        console.error("Error updating product stock quantities:", error);
        // Continue with order status update even if stock update fails
      }

      setOrder((prev) => (prev ? { ...prev, order_status: newStatus } : null));

      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link prefetch href="/admin/orders">
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

      <div className="mb-6 flex items-center gap-4">
        <p className="text-sm font-medium">Update Status:</p>
        <Select
          value={order.order_status}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Pending Advance">Pending Advance</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Order Items</h2>

              <div className="divide-y">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="py-4 md:grid md:grid-cols-4 md:items-center"
                  >
                    <div className="flex items-center space-x-4 md:col-span-2">
                      <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded bg-gray-100">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt_text || item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.attributes_selected &&
                          Object.keys(item.attributes_selected).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {Object.entries(item.attributes_selected).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
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

                  {order.payment_screenshot_base64 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-medium">
                        Payment Receipt:
                      </p>
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-white">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="block h-full w-full cursor-pointer">
                              <img
                                src={order.payment_screenshot_base64}
                                alt="Payment Receipt"
                                className="h-full w-full object-contain hover:opacity-90 transition-opacity"
                              />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogTitle className="sr-only">
                              Payment Receipt for Order #{order.order_number}
                            </DialogTitle>
                            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                              <img
                                src={order.payment_screenshot_base64}
                                alt="Payment Receipt"
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const link = document.createElement("a");
                                  link.href = order.payment_screenshot_base64!;
                                  link.download = `payment-receipt-${order.order_number}.jpg`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Click image to view full size
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-medium">Customer Information</h2>

              <div className="space-y-4">
                <div>
                  <p className="font-medium">{order.shipping_address.name}</p>
                  <p className="text-sm text-muted-foreground">{order.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium">Shipping Address</h3>
                  <p className="mt-1 text-sm">
                    {order.shipping_address.street}
                    <br />
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.province}
                  </p>
                  <p className="mt-1 text-sm">
                    Phone: {order.shipping_address.phone}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
