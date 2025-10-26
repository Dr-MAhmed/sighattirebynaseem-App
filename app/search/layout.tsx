import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | (SAN) sigh Attire by Naseem",
  description:
    "Search our collection of elegant and modest Islamic clothing. Filter by category, price, and other preferences to find your perfect modest fashion piece.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
