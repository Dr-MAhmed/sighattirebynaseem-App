"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCart } from "@/lib/store/cart-actions";
import { useAuth } from "@/lib/firebase/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchModal } from "@/components/search/search-modal";
import Image from "next/image";
import { categoriesData, runCategorySync } from "@/lib/firebase/category-sync";
import MiddleBar from "./middle-bar";
import TopBar from "./top-bar";

export function SiteHeader() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { cartItems, openCart } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [categories] = useState(categoriesData);
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({});
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Sync categories when component mounts (only when user is an admin)
  useEffect(() => {
    const syncCategoriesIfAdmin = async () => {
      // Check if user is admin (you can customize this logic)
      if (user && user.email === "admin@example.com") {
        console.log("Admin user detected, syncing categories to Firestore...");
        const result = await runCategorySync();
        console.log(result.message);
      }
    };

    syncCategoriesIfAdmin();
  }, [user]);

  const staticRoutes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/products",
      label: "All Products",
      active: pathname === "/products",
    },
  ];

  return (
    <header className="sticky top-[-1] z-40 w-full border-b bg-background">
      <TopBar />
      <MiddleBar />
      <div className="container flex items-center h-16 px-4 sm:px-6">
        {/* Mobile Navigation */}
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="px-0 mr-2 text-base hover:bg-transparent focus:ring-0 md:hidden"
            >
              <Menu className="w-6 h-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[80%] max-w-sm p-0 flex flex-col"
          >
            <SheetHeader className="flex-shrink-0 p-4 border-b">
              <SheetTitle className="text-left">Menu</SheetTitle>
            </SheetHeader>
            <div className="flex-1 px-4 py-6 overflow-y-auto">
              <nav className="grid gap-4 text-base font-medium">
                {staticRoutes.map((route, i) => (
                  <a
                    key={route.href}
                    href={route.href}
                    onClick={() => setMobileNavOpen(false)}
                    className={`${
                      route.active
                        ? "text-foreground font-bold"
                        : "text-muted-foreground"
                    } hover:text-foreground p-2 rounded-md hover:bg-accent`}
                  >
                    {route.label}
                  </a>
                ))}
                {/* Categories with subcategories */}
                {categories.map((cat) => (
                  <div key={cat.categoryId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <a
                        href={`/categories/${cat.slug}`}
                        onClick={() => setMobileNavOpen(false)}
                        className={`${
                          pathname === `/categories/${cat.slug}`
                            ? "text-foreground font-bold"
                            : "text-muted-foreground"
                        } hover:text-foreground p-2 rounded-md hover:bg-accent block flex-1`}
                      >
                        {cat.name}
                      </a>
                      {cat.subcategories && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCategory(cat.categoryId)}
                          className="p-2"
                        >
                          {expandedCategories[cat.categoryId] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </div>
                    {cat.subcategories &&
                      expandedCategories[cat.categoryId] && (
                        <div className="pl-4 space-y-1">
                          {cat.subcategories.map((subcat) => (
                            <a
                              key={subcat.slug}
                              href={`/categories/${cat.slug}/${subcat.slug}`}
                              onClick={() => setMobileNavOpen(false)}
                              className="block p-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                            >
                              {subcat.name}
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </nav>

              <div className="pt-6 mt-6 border-t">
                <div className="flex flex-col gap-4">
                  <a
                    href={user ? "/account" : "/login"}
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <User className="w-5 h-5" />
                    <span>{user ? "My Account" : "Login / Register"}</span>
                  </a>
                  <a
                    href="/wishlist"
                    onClick={() => setMobileNavOpen(false)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </a>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="flex items-center justify-start gap-3 ml-2 sm:ml-4">
          <Link prefetch href="/" className="flex items-center">
            <span className="flex-shrink-0">
              <Image
                src="/cellogo4.png"
                alt="Sigh Attire by Naseem"
                width={30}
                height={17}
                className="w-auto h-[30px] sm:h-[36px] dark:invert object-contain hover:scale-105 transition-transform duration-200"
                priority
              />
            </span>
          </Link>
          <Link
            prefetch
            href="/about"
            className="text-muted-foreground hover:text-foreground md:hidden text-[14px] font-semibold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px] hover:underline transition-all duration-200"
          >
            Sigh Attire by Naseem
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="items-center hidden gap-4 mx-6 md:flex">
          {staticRoutes.map((route) => (
            <a
              key={route.href}
              href={route.href}
              className={`${
                route.active ? "text-foreground" : "text-muted-foreground"
              } text-sm whitespace-nowrap font-medium transition-colors hover:text-foreground`}
            >
              {route.label}
            </a>
          ))}
          {/* Categories with subcategories */}
          {categories.map((cat) => (
            <div key={cat.categoryId} className="relative group">
              <a
                href={`/categories/${cat.slug}`}
                className={`${
                  pathname === `/categories/${cat.slug}`
                    ? "text-foreground"
                    : "text-muted-foreground"
                } text-sm whitespace-nowrap font-medium transition-colors hover:text-foreground`}
              >
                {cat.name}
              </a>
              {cat.subcategories && (
                <div className="absolute left-0 top-full hidden group-hover:block bg-background border rounded-md shadow-lg p-2 min-w-[200px]">
                  {cat.subcategories.map((subcat) => (
                    <a
                      key={subcat.slug}
                      href={`/categories/${cat.slug}/${subcat.slug}`}
                      className="block px-4 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
                    >
                      {subcat.name}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="flex items-center gap-1 ml-auto sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(true)}
            className="text-muted-foreground"
          >
            <Search className="w-5 h-5" />
            <span className="sr-only">Search</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={openCart}
            className="text-muted-foreground"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                  {cartItems.length}
                </span>
              )}
            </div>
            <span className="sr-only">Cart</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:flex text-muted-foreground"
          >
            <a href="/wishlist">
              <Heart className="w-5 h-5" />
              <span className="sr-only">Wishlist</span>
            </a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden sm:flex text-muted-foreground"
          >
            <a href={user ? "/account" : "/login"}>
              <User className="w-5 h-5" />
              <span className="sr-only">{user ? "Account" : "Login"}</span>
            </a>
          </Button>

          <ThemeToggle />
        </div>
      </div>
      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
      <CartSheet />
    </header>
  );
}
export default SiteHeader;
