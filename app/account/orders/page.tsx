"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/firebase/auth-context";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";

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
  order_date: Timestamp;
  total_amount: number;
  order_status: string;
  items: OrderItem[];
  payment_screenshot_base64?: string;
  advance_payment_status: string;
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
      return;
    }

    const fetchOrders = async () => {
      if (!user) {
        console.log("No user found, skipping order fetch");
        return;
      }

      try {
        console.log("Fetching orders for user:", user.uid);
        const ordersRef = collection(db, "orders");

        // First try with the compound query
        try {
          const q = query(
            ordersRef,
            where("user_id", "==", user.uid),
            orderBy("order_date", "desc")
          );

          const querySnapshot = await getDocs(q);
          console.log("Number of orders found:", querySnapshot.size);

          const ordersData = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("Order data:", data);
            return {
              id: doc.id,
              ...data,
              order_date:
                data.order_date instanceof Timestamp
                  ? data.order_date
                  : Timestamp.fromDate(new Date(data.order_date)),
            } as Order;
          });

          console.log("Processed orders:", ordersData);
          setOrders(ordersData);
        } catch (error: any) {
          // If the error is about missing index, show a helpful message
          if (error.message?.includes("requires an index")) {
            console.log(
              "Index is still building. Please wait a few minutes and refresh the page."
            );
            // Fallback to a simpler query while index is building
            const simpleQuery = query(
              ordersRef,
              where("user_id", "==", user.uid)
            );
            const querySnapshot = await getDocs(simpleQuery);
            const ordersData = querySnapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                order_date:
                  data.order_date instanceof Timestamp
                    ? data.order_date
                    : Timestamp.fromDate(new Date(data.order_date)),
              } as Order;
            });
            // Sort the orders in memory
            ordersData.sort(
              (a, b) => b.order_date.toMillis() - a.order_date.toMillis()
            );
            setOrders(ordersData);
          } else {
            throw error; // Re-throw if it's a different error
          }
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user, loading, router]);

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
      <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button asChild variant="outline">
          <Link prefetch href="/account">
            Back to Account
          </Link>
        </Button>
      </div>

      {orders.length === 0 ? (
        <div className="p-8 text-center border rounded-lg bg-card">
          <Package className="w-12 h-12 mx-auto text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No orders found</h2>
          <p className="mt-2 text-muted-foreground">
            You haven't placed any orders yet.
          </p>
          <Button asChild className="mt-4">
            <Link prefetch href="/products">
              Start Shopping
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden border rounded-lg bg-card"
            >
              <div className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-medium">Order #{order.order_number}</h2>
                    <Badge className={getStatusColor(order.order_status)}>
                      {order.order_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Placed on {order.order_date.toDate().toLocaleDateString()} •{" "}
                    {order.items.length} items
                  </p>
                  {order.payment_screenshot_base64 && (
                    <p className="mt-1 text-sm text-green-600">
                      Payment screenshot uploaded
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.advance_payment_status}
                    </p>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link prefetch href={`/account/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 overflow-hidden bg-gray-100 rounded aspect-square min-w-fit">
                        {item.product?.images?.[0]?.url ? (
                          <Image
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt_text || item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                            {item.quantity}x
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.price_per_item)} each
                        </p>
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
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center justify-center text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
