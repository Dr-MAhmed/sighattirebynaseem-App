"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  getDocs,
  DocumentData,
  limit,
  onSnapshot,
  orderBy,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ShoppingBag } from "lucide-react";

interface OrderNotificationProps {
  userName: string;
  productName: string;
  city: string;
}

// Order data interface
interface OrderData extends DocumentData {
  id: string;
  shipping_address?: {
    name?: string;
    city?: string;
  };
  user_name?: string;
  userName?: string;
  name?: string;
  city?: string;
  location?: string;
  product_name?: string;
  items?: Array<{
    product_name?: string;
    name?: string;
    product_id?: string;
  }>;
  products?: Array<{
    name?: string;
  }>;
}

// Simple notification component
function OrderNotification({
  userName,
  productName,
  city,
}: OrderNotificationProps) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-3 rounded-lg shadow-lg">
      <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
        <ShoppingBag className="h-4 w-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm whitespace-normal">
          <span className="font-bold">{userName}</span> from{" "}
          <span className="font-bold">{city}</span> just purchased
        </p>
        <p className="text-sm text-white font-semibold truncate">
          {productName}
        </p>
      </div>
    </div>
  );
}

// Function to process an order and show notification
const processOrder = (order: OrderData) => {
  // Extract user info
  const userName =
    (order.shipping_address && order.shipping_address.name) ||
    order.user_name ||
    order.userName ||
    order.name ||
    "Customer";

  const city =
    (order.shipping_address && order.shipping_address.city) ||
    order.city ||
    order.location ||
    "Pakistan";

  // Get product name
  let productName = "Product";

  if (order.items && Array.isArray(order.items) && order.items.length > 0) {
    productName =
      order.items[0].product_name || order.items[0].name || "Product";
  } else if (order.product_name) {
    productName = order.product_name;
  } else if (
    order.products &&
    Array.isArray(order.products) &&
    order.products.length > 0
  ) {
    productName = order.products[0].name || "Product";
  }

  console.log(
    `Showing notification: ${userName} from ${city} bought ${productName}`
  );

  // Show notification
  toast.info(
    <OrderNotification
      userName={userName}
      productName={productName}
      city={city}
    />,
    {
      position: "top-left",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      className: "order-notification-toast",
    }
  );
};

export default function OrderNotificationProvider() {
  useEffect(() => {
    // Create a query to only get orders created after component mount
    const now = new Date();
    const ordersRef = collection(db, "orders");

    // This query orders by creation time and only gets orders created after component mount
    const ordersQuery = query(
      ordersRef,
      where("order_date", ">", Timestamp.fromDate(now)),
      limit(10)
    );

    // Set up the realtime listener
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        // Process only the added documents
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("New order detected:", change.doc.id);
            const order = {
              id: change.doc.id,
              ...change.doc.data(),
            } as OrderData;

            // Process the new order and show notification
            processOrder(order);
          }
        });
      },
      (error) => {
        console.error("Error in order notification listener:", error);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      console.log("Cleaning up order notification listener");
      unsubscribe();
    };
  }, []);

  return (
    <ToastContainer
      position="top-left"
      autoClose={5000}
      hideProgressBar={true}
      newestOnTop={false}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      limit={3}
      theme="light"
    />
  );
}
