import { getProductBySlug } from "@/lib/firebase/firestore";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/product-detail";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
    };
  }
  return {
    title: `${product.name} - (SAN) Sigh Attire by Naseem`,
    description: product.description || `${product.name} - SighAttireByNaseem`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug((await params).slug);
  if (product) {
    return <ProductDetail product={product} />;
  }
  notFound();
}
