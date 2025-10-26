"use client"

import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { ProductForm } from "@/components/admin/product-form"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/config"
import type { ProductType } from "@/types/product"

export default function EditProductPage() {
  const { adminUser, isLoading } = useAdminAuth()
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<ProductType | null>(null)
  const [isLoadingProduct, setIsLoadingProduct] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // If the ID is "new", we don't need to fetch a product
        if (productId === "new") {
          setIsLoadingProduct(false)
          return
        }

        // Get the product directly by ID
        const productRef = doc(db, "products", productId)
        const productDoc = await getDoc(productRef)

        if (!productDoc.exists()) {
          console.error("Product not found:", productId)
          setIsLoadingProduct(false)
          return
        }

        const productData = productDoc.data() as ProductType
        setProduct({
          ...productData,
          productId: productDoc.id,
          created_at: productData.created_at?.toDate?.(),
          updated_at: productData.updated_at?.toDate?.(),
        })
        setIsLoadingProduct(false)
      } catch (error) {
        console.error("Error fetching product:", error)
        setIsLoadingProduct(false)
      }
    }

    if (adminUser && productId) {
      fetchProduct()
    }
  }, [adminUser, productId])

  if (isLoading || isLoadingProduct) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!adminUser) {
    return null // Will redirect to login
  }

  if (!product && !isLoadingProduct) {
    // If the ID is "new", render the product form for a new product
    if (productId === "new") {
      return (
        <div className="min-h-screen bg-gray-100">
          <AdminHeader />
          <main className="py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Product</h1>
              <ProductForm />
            </div>
          </main>
        </div>
      )
    }

    // Otherwise, show the "Product Not Found" message
    return (
      <div className="min-h-screen bg-gray-100">
        <AdminHeader />
        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Product Not Found</h1>
            <p>The product you are looking for does not exist or has been deleted.</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Product</h1>
          {product && <ProductForm product={product} isEdit />}
        </div>
      </main>
    </div>
  )
}
