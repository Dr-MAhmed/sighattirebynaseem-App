import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Policy | (SAN) sighAttireByNaseem",
  description:
    "Information about our shipping methods, delivery times, and costs for SighAttireByNaseem products.",
};

export default function ShippingPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
