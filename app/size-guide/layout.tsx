import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Size Guide | (SAN) sighAttireByNaseem",
  description:
    "Find your perfect fit with our detailed size guide for abayas and Islamic clothing at SighAttireByNaseem.",
};

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
