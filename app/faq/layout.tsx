import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | (SAN) sighAttireByNaseem",
  description:
    "Find answers to common questions about our products, orders, shipping, and more at SighAttireByNaseem.",
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
