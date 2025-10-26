"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdminAuth } from "@/lib/admin/admin-auth-context";
import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const { adminUser, logout } = useAdminAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/admin" },
    { name: "Products", href: "/admin/products" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Customers", href: "/admin/customers" },
  ];

  return (
    <header className="bg-white shadow dark:bg-[#160E1B] dark:text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                prefetch
                href="/admin"
                className="text-xl font-bold text-gray-900 dark:text-gray-100"
              >
                SAN Admin
              </Link>
            </div>
            <nav
              className="hidden sm:ml-6 sm:flex sm:space-x-8"
              aria-label="Global"
            >
              {navigation.map((item) => (
                <Link
                  prefetch
                  key={item.name}
                  href={item.href}
                  className={cn(
                    pathname === item.href
                      ? "border-indigo-500 text-gray-900 dark:text-gray-100"
                      : "border-transparent text-gray-500 dark:text-gray-100 hover:border-gray-300 hover:text-gray-700",
                    "inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium"
                  )}
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-100">
                {adminUser?.name || "Admin"}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-black dark:text-gray-100"
              >
                <LogOut className="h-4 w-4 mr-2 text-gray-900 dark:text-white" />
                Logout
              </Button>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Button
              variant="ghost"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                prefetch
                key={item.name}
                href={item.href}
                className={cn(
                  pathname === item.href
                    ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                    : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800",
                  "block border-l-4 py-2 pl-3 pr-4 text-base font-medium"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 pb-3 pt-4">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {adminUser?.name?.charAt(0) || "A"}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">
                  {adminUser?.name}
                </div>
                <div className="text-sm font-medium text-gray-500">
                  {adminUser?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Button
                variant="ghost"
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
