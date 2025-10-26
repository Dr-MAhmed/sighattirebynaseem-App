"use client"

import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { getAllProducts } from "@/lib/firebase/firestore"
import type { ProductType } from "@/types/product"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/config"

export default function AdminDashboard() {
  const { adminUser } = useAdminAuth()
  const [products, setProducts] = useState<ProductType[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [totalOrders, setTotalOrders] = useState(0)
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const allProducts = await getAllProducts(100)
        setProducts(allProducts)
        setIsLoadingProducts(false)

        // Fetch orders
        const ordersRef = collection(db, "orders")
        const ordersSnapshot = await getDocs(ordersRef)
        setTotalOrders(ordersSnapshot.size)
        setIsLoadingOrders(false)

        // Calculate unique customers and total revenue
        const customerSet = new Set<string>()
        let revenue = 0

        ordersSnapshot.docs.forEach((doc) => {
          const orderData = doc.data()
          customerSet.add(orderData.user_id)
          revenue += orderData.total_amount || 0
        })

        setTotalCustomers(customerSet.size)
        setIsLoadingCustomers(false)
        setTotalRevenue(revenue)
        setIsLoadingRevenue(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoadingProducts(false)
        setIsLoadingOrders(false)
        setIsLoadingCustomers(false)
        setIsLoadingRevenue(false)
      }
    }

    fetchData()
  }, [])

  const formatPriceInPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const stats = [
    {
      name: "Total Products",
      value: isLoadingProducts ? "Loading..." : products.length,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Total Orders",
      value: isLoadingOrders ? "Loading..." : totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
    },
    {
      name: "Total Customers",
      value: isLoadingCustomers ? "Loading..." : totalCustomers.toString(),
      icon: Users,
      color: "bg-purple-100 text-purple-600",
    },
    {
      name: "Total Revenue",
      value: isLoadingRevenue ? "Loading..." : formatPriceInPKR(totalRevenue),
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black dark:text-white">
      <AdminHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">Dashboard</h1>

          <div className="mt-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 dark:text-gray-200">
              {stats.map((stat) => (
                <Card key={stat.name}>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`rounded-md p-2 ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-100">{stat.name}</p>
                        <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity and notifications will appear here.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-gray-500">No recent activity to display.</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
