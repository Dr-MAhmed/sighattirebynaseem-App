import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse all products | (SAN) sighAttireByNaseem",
  description:
    "Explore our wide range of products, including abayas, hijabs, and more, at SighAttireByNaseem.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
