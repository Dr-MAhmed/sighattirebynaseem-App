import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmation | (SAN) sigh Attire by Naseem",
  description:
    "Thank you for your purchase! Your order has been successfully placed and is being processed. View your order details and track your shipment.",
};

export default function CheckoutSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
