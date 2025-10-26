"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, Heart, LogOut, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/firebase/auth-context";

export default function AccountPage() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <h1 className="mb-8 text-3xl font-bold">My Account</h1>

      <div className="p-6 mb-8 border rounded-lg bg-card">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold">
              {user.displayName || user.email}
            </h2>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View Orders</div>
            <p className="text-xs text-muted-foreground">
              Track and manage your orders
            </p>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Wishlist</CardTitle>
            <Heart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">My Wishlist</div>
            <p className="text-xs text-muted-foreground">
              View and manage your saved items
            </p>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Addresses</CardTitle>
            <MapPin className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Shipping Addresses</div>
            <p className="text-xs text-muted-foreground">Manage your shipping addresses</p>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/account/addresses">Manage Addresses</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <User className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Account Details</div>
            <p className="text-xs text-muted-foreground">Update your personal information</p>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/account/profile">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Shopping</CardTitle>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Continue Shopping</div>
            <p className="text-xs text-muted-foreground">
              Browse our latest products
            </p>
            <Button asChild variant="ghost" className="w-full mt-4">
              <Link href="/products">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
