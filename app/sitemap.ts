import { getAllProducts, getCategories } from "@/lib/firebase/firestore";
import { MetadataRoute } from "next";

/**
 * Generate a sitemap for the website
 * Documentation: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL for the website
  const baseUrl = "https://sighattirebynaseem.com";

  // Static routes from the file structure
  const routes = [
    // Home page
    {
      url: `${baseUrl}`,
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    // Main pages
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    // Auth pages
    {
      url: `${baseUrl}/login`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/register`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    // Policy pages
    {
      url: `${baseUrl}/terms-of-service`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/returns-policy`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/size-guide`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/faq`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/custom-request`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // For dynamic routes, you would typically fetch data from your database
  // and add them to the sitemap. For example:
  //
  const products = await getAllProducts();
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  //
  const categories = await getCategories();
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  //
  return [...routes, ...productRoutes, ...categoryRoutes];

  return routes;
}
