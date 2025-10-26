import type React from "react";
import { AdminAuthProvider } from "@/lib/admin/admin-auth-context";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side authentication check
  const cookieStore = await cookies();
  const isAdminAuthenticated =
    cookieStore.has("adminAuthenticated") &&
    cookieStore.get("adminAuthenticated")?.value === "true";

  // If not authenticated, redirect to login
  if (!isAdminAuthenticated) {
    redirect("/login?redirect=/admin");
  }

  return (
    <AdminAuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <AdminProtectedRoute>
          <div className="min-h-screen bg-background">{children}</div>
        </AdminProtectedRoute>
        <Toaster />
      </ThemeProvider>
    </AdminAuthProvider>
  );
}
