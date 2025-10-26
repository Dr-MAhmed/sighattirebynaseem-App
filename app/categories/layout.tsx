import type { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  const category = pathname ? pathname.split("/").pop() : "";
  return {
    title: `Shop By ${category} Category | (SAN) Sigh Attire by Naseem`,
    description:
      "Browse our complete collection of elegant and modest Islamic clothing. Discover abayas, hijabs, prayer wear, and more at Sigh Attire by Naseem.",
  };
}

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
