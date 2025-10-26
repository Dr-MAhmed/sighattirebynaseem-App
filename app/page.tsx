import Link from "next/link";
import { Button } from "@/components/ui/button";
import FeaturedProducts from "@/components/featured-products";
import NewArrivals from "@/components/new-arrivals";
import BestSellers from "@/components/best-sellers";
import CategoryShowcase from "@/components/category-showcase";
import CustomerReviews from "@/components/customer-reviews";
import HeroCarousel from "@/components/hero-carousel";
import NewsletterSignup from "@/components/newsletter-signup";
import {
  getNewArrivals,
  getProductsByCategory,
} from "@/lib/firebase/firestore";
import NamazChaddarShowcase from "@/components/namazchaddarshowcase";

export default async function Home() {
  // Fetch products for all sections concurrently
  const [abayasData, newArrivalsData, hijabsData] = await Promise.all([
    getProductsByCategory("abayas", 8), // Fetch Abayas for the first section
    getNewArrivals(8), // Fetch New Arrivals
    getProductsByCategory("hijabs", 8), // Fetch Hijabs for the Best Sellers section
  ]);

  const seenProductIds = new Set<string>();

  // Filter New Arrivals - keep all of them and mark their IDs as seen (Highest priority)
  const uniqueNewArrivals = newArrivalsData.filter((product) => {
    if (product.productId && !seenProductIds.has(product.productId)) {
      seenProductIds.add(product.productId);
      return true;
    }
    return false;
  });

  // Filter Abayas - only keep if not in New Arrivals (Second highest priority)
  const uniqueAbayas = abayasData.filter((product) => {
    if (product.productId && !seenProductIds.has(product.productId)) {
      seenProductIds.add(product.productId);
      return true;
    }
    return false;
  });

  // Filter Hijabs for Best Sellers - only keep if not in New Arrivals or Abayas (Lowest priority)
  const uniqueHijabs = hijabsData.filter((product) => {
    if (product.productId && !seenProductIds.has(product.productId)) {
      seenProductIds.add(product.productId);
      return true;
    }
    return false;
  });

  // Limit the number of products for each section after filtering
  const finalAbayas = uniqueAbayas.slice(0, 4);
  const finalNewArrivals = uniqueNewArrivals.slice(0, 4);
  const finalBestSellers = uniqueHijabs.slice(0, 4); // Pass unique Hijabs to Best Sellers

  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full">
        <HeroCarousel />
        <div className="container relative flex flex-col items-center justify-center h-full px-4 mx-auto text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
            {/* Sigh Attire by Naseem */}
          </h1>
          <p className="max-w-2xl mb-8 text-lg text-white/90">
            {/* Welcome to Sigh Attire by Naseem — because modesty deserves to be felt, not just seen! */}
          </p>
          <div className="relative flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0 top-20 lg:top-48">
            <Button asChild size="lg" className="relative top-3 lg:top-0">
              <Link prefetch href="/products">
                Shop Now
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-white bg-white/10 hover:bg-white/20"
            >
              <Link prefetch href="/custom-request">
                Request Custom Design
              </Link>
            </Button>
          </div>
          <p className="text-white/90 text-sm relative top-[29%] lg:top-[35%]">
            Sigh it out, Wear it proud!
          </p>
        </div>
      </section>

      {/* Category Showcase */}
      <CategoryShowcase />

      {/* Namaz Chaddar Showcase */}
      <NamazChaddarShowcase />

      {/* New Arrivals Section */}
      <NewArrivals products={finalNewArrivals} />

      {/* Featured Products Section - Now displaying Abayas */}
      <FeaturedProducts products={finalAbayas} />

      {/* Best Sellers Section */}
      <BestSellers products={finalBestSellers} />

      {/* Trust Signals */}
      <section className="py-12 bg-primary/5 dark:bg-primary/10">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Reliable Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Within 7-10 business days
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Secure Payment</h3>
              <p className="text-sm text-muted-foreground">
                Cash on delivery available
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Quality Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                Premium fabrics and craftsmanship
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-4 mb-4 rounded-full bg-primary/10 dark:bg-primary/20">
                <svg
                  className="w-8 h-8 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Customer Support</h3>
              <p className="text-sm text-muted-foreground">
                24/7 dedicated support
              </p>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSignup />
      {/* Customer Reviews */}
      <CustomerReviews />
    </main>
  );
}
