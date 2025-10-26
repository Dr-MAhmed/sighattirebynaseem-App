"use client"

import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { adminUser, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !adminUser) {
      router.push("/login")
    }
  }, [adminUser, isLoading, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return adminUser ? <>{children}</> : null
} 