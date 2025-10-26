"use client"

import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductForm } from "@/components/admin/product-form"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function NewProductPage() {
  const { adminUser, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !adminUser) {
      router.push("/admin/login")
    }
  }, [adminUser, isLoading, router])

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!adminUser) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
      <AdminHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-50 mb-6">Add New Product</h1>
          <ProductForm />
        </div>
      </main>
    </div>
  )
}
