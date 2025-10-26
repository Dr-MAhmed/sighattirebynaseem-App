"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Package, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "@/lib/firebase/config";
import {
  collection,
  query,
  orderBy,
  getDocs,
  Timestamp,
  where,
} from "firebase/firestore";
import { formatCurrency } from "@/lib/utils";
import { AdminHeader } from "@/components/admin/admin-header";

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
  user_id: string;
  email: string;
  shipping_address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    province: string;
  };
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, orderBy("order_date", "desc"));
        const querySnapshot = await getDocs(q);

        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          order_date:
            doc.data().order_date instanceof Timestamp
              ? doc.data().order_date
              : Timestamp.fromDate(new Date(doc.data().order_date)),
        })) as Order[];

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 md:px-6 lg:py-16">
      <div className="mb-8 flex items-center justify-between">
        <AdminHeader />
        <h1 className="text-3xl font-bold">Manage Orders</h1>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order number, email, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending Advance">Pending Advance</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No orders found</h2>
          <p className="mt-2 text-muted-foreground">
            {searchQuery || statusFilter !== "all"
              ? "Try adjusting your search or filter criteria"
              : "There are no orders in the system yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-lg border bg-card"
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
                  <p className="mt-1 text-sm">
                    Customer: {order.shipping_address.name} ({order.email})
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
                    <Link prefetch href={`/admin/orders/${order.id}`}>
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="relative aspect-square h-16 w-16 min-w-fit overflow-hidden rounded bg-gray-100">
                        {item.product?.images?.[0]?.url ? (
                          <img
                            src={item.product.images[0].url}
                            alt={item.product.images[0].alt_text || item.name}
                            className="h-full w-full object-cover"
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
