import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders | (SAN) Sigh Attire by Naseem",
  description:
    "View and track your orders from Sigh Attire by Naseem. Check order status, shipping details, and order history all in one place.",
};

export default function AccountOrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
