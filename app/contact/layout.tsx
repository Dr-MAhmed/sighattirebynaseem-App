import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | (SAN) sighAttireByNaseem",
  description:
    "Get in touch with SighAttireByNaseem for any inquiries about our modest abayas and Islamic clothing.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
