"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("order");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!orderNumber) {
      router.push("/");
      return;
    }

    // Show toast notification after 3 seconds
    const toastTimer = setTimeout(() => {
      toast.success(
        "Thank you! Your order has been placed successfully. Our team will contact you soon to confirm your order",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }, 3000);

    // Countdown to redirect to home page
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(toastTimer);
    };
  }, [orderNumber, router]);

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center md:px-6">
        <CheckCircle className="h-20 w-20 text-green-500" />
        <h1 className="mt-6 text-3xl font-bold">Order Placed Successfully!</h1>
        <p className="mt-4 max-w-md text-muted-foreground">
          Thank you! Your order has been placed successfully. Our team will
          contact you soon to confirm your order.
        </p>

        {orderNumber && (
          <div className="mt-6 rounded-lg bg-muted p-4">
            <p className="font-medium">Order Number:</p>
            <p className="text-xl font-bold">{orderNumber}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please save this order number for your reference.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <Button asChild>
            <Link prefetch href="/account/orders">
              View My Orders
            </Link>
          </Button>
          <div>
            <Button variant="outline" asChild>
              <Link prefetch href="/">
                Return to Home (auto-redirect in {countdown}s)
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
