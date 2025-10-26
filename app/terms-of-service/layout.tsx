import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | (SAN) sighAttireByNaseem",
  description:
    "Learn about the terms and conditions that govern your use of SighAttireByNaseem's website and services.",
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
