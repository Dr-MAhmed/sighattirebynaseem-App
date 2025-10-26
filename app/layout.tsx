import type React from "react";
import ClientRootLayout from "./client-layout";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { HighlightInit } from "@highlight-run/next/client";
import "./globals.css";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/store/cart-context";
import { WishlistProvider } from "@/lib/store/wishlist-context";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "SAN - Sigh Attire by Naseem",
  applicationName: "Sigh Attire by Naseem",
  metadataBase: new URL("https://sighattirebynaseem.com"),
  description:
    "Elegant and modest abayas inspired by the timeless grace of Naseem. Crafted with love, using premium fabrics and thoughtful designs. Rooted in Islamic values, designed to embody dignity, comfort, and beauty.",
  generator: "Next.js",
  icons: { icon: "/desklogo2.png" },
  keywords: [
    "abaya",
    "modest fashion",
    "Islamic clothing",
    "Naseem abayas",
    "elegant abayas",
    "modest wear",
    "premium fabrics",
    "thoughtful designs",
    "dignity and comfort",
    "SAN",
    "Sigh Attire by Naseem",
  ],
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await headers();
  const ipAddress = (
    header.get("x-forwarded-for") || header.get("remote-addr")
  )?.split(",")[0];
  return (
    <>
      <HighlightInit
        projectId={"0dq38x4e"}
        serviceName="nextjs-frontend"
        tracingOrigins
        networkRecording={{
          enabled: true,
          recordHeadersAndBody: true,
        }}
        disableBackgroundRecording
        environment={process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME}
        debug
      />
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="color-scheme" content="light dark" />
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="google-site-verification"
            content="2IGfLA3JntHHFxxxZR4VIqsyiBFDseaq6GWqjfGNdm0"
          />
        </head>
        <body className={inter.className}>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                        (function() {
                          // On page load or when changing themes, best to add inline in \`head\` to avoid FOUC
                          if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                            document.documentElement.classList.add('dark');
                          } else {
                            document.documentElement.classList.remove('dark');
                          }
                        })();
                      `,
            }}
          />
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <ClientRootLayout children={children} />
                  <Toaster />
                  <ToastContainer />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
