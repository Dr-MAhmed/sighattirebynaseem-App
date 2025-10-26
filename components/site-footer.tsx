import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-medium">
              About Sigh Attire by Naseem
            </h3>
            <p className="text-sm text-muted-foreground">
              Elegant and modest abayas inspired by the timeless grace of
              Naseem. Crafted with love, using premium fabrics and thoughtful
              designs. Rooted in Islamic values, designed to embody dignity,
              comfort, and beauty.
              <br />
              <br />
              <strong> Vision:</strong> To become a leading international
              company offering a diverse collection of timeless, authentic
              modest clothing that provides assurance and satisfaction to
              clients around the world.
              <br />
              <br />
              <strong>Mission:</strong> To embrace Women's identity through
              carefully designed modest clothing that integrates ethical
              practices and high-quality stitching to ensure durability and
              excellence.
            </p>
            <br />
            <Link
              prefetch
              href="/about"
              className="inline-flex items-center justify-center h-10 px-4 py-2 text-sm font-medium transition-colors rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Brand Story
            </Link>
            <div className="flex mt-4 space-x-4">
              <Link
                prefetch
                href="https://www.facebook.com/share/1ZW1mozwXu/?mibextid=wwXIfr"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook className="w-5 h-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                prefetch
                href="https://www.instagram.com/sighattirebynaseem/profilecard/?igsh=bnRuMjR4anJjdGRq"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram className="w-5 h-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                prefetch
                href="https://www.tiktok.com/@sighattirebynaseem?_t=ZS-8wI3M6gXAng&_r=1"
                className="text-muted-foreground hover:text-primary"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  prefetch
                  href="/categories/abayas"
                  className="text-muted-foreground hover:text-primary"
                >
                  Abayas
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/modest-maxi-dresses"
                  className="text-muted-foreground hover:text-primary"
                >
                  Modest Maxi & Dresses
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/prayer-namaz-chadar"
                  className="text-muted-foreground hover:text-primary"
                >
                  Prayer / Namaz Chadar
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/new-arrivals"
                  className="text-muted-foreground hover:text-primary"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/custom-request"
                  className="text-muted-foreground hover:text-primary"
                >
                  Custom Designs
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/irani-chadar"
                  className="text-muted-foreground hover:text-primary"
                >
                  Irani Chadar
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/hijabs"
                  className="text-muted-foreground hover:text-primary"
                >
                  Hijabs
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/categories/essentials"
                  className="text-muted-foreground hover:text-primary"
                >
                  Essentials
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  prefetch
                  href="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/faq"
                  className="text-muted-foreground hover:text-primary"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/size-guide"
                  className="text-muted-foreground hover:text-primary"
                >
                  Size Guide
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/shipping-policy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/returns-policy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Returns, Exchanges & Cancellations Policy
                </Link>
              </li>

              {/* <li>
                <Link prefetch href="/about" className="text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li> */}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  prefetch
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-primary"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  prefetch
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Contact Info</h3>
              <address className="text-sm not-italic text-muted-foreground">
                <p>Lahore, Pakistan</p>
                <p className="mt-2">Phone: +92 3354034038</p>
                <p>Email: info@sighattirebynaseem.com</p>
              </address>
            </div>
          </div>
        </div>
        <div className="pt-8 mt-12 border-t">
          <p className="text-sm text-center text-muted-foreground">
            &copy; {new Date().getFullYear()} Sigh Attire by Naseem. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
