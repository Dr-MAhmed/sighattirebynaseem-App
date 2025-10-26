import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Returns Policy | (SAN) sighAttireByNaseem",
  description:
    "Our policy for returns, exchanges, and refunds for SighAttireByNaseem products.",
};

export default function ReturnsPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
