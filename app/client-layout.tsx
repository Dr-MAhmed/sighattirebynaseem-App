"use client";

import type React from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AdminAuthProvider } from "@/lib/admin/admin-auth-context";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import WhatsAppButton from "@/components/WhatsAppButton";
import OrderNotificationProvider from "@/components/order-notification-provider";
import { ProgressProvider } from "@bprogress/next/app";

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <ErrorBoundary>
        <div className="relative flex flex-col min-h-screen">
          <ProgressProvider
            height="4px"
            color="rgb(184 112 219)"
            options={{ showSpinner: false }}
            shallowRouting
            disableSameURL
            shouldCompareComplexProps
          >
            <SiteHeader />
            <WhatsAppButton />
            <OrderNotificationProvider />
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </ProgressProvider>
        </div>
      </ErrorBoundary>
    </AdminAuthProvider>
  );
}
