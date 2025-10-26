"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { db } from "@/lib/firebase/config"
import { collection, query, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { AdminHeader } from "@/components/admin/admin-header"

interface Customer {
  id: string
  email: string
  name: string
  phone: string
  address: string
  total_orders: number
  total_spent: number
  last_order_date: Timestamp
}

// Helper function to format price in PKR
const formatPriceInPKR = (amount: number) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function AdminCustomersPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const ordersRef = collection(db, "orders")
        const q = query(ordersRef, orderBy("order_date", "desc"))
        const querySnapshot = await getDocs(q)
        
        // Process orders to get unique customers
        const customerMap = new Map<string, Customer>()
        
        querySnapshot.docs.forEach((doc) => {
          const orderData = doc.data()
          const customerId = orderData.user_id
          
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              id: customerId,
              email: orderData.email,
              name: orderData.shipping_address.name,
              phone: orderData.shipping_address.phone,
              address: `${orderData.shipping_address.street}, ${orderData.shipping_address.city}, ${orderData.shipping_address.province}`,
              total_orders: 1,
              total_spent: orderData.total_amount,
              last_order_date: orderData.order_date
            })
          } else {
            const customer = customerMap.get(customerId)!
            customer.total_orders += 1
            customer.total_spent += orderData.total_amount
            if (orderData.order_date > customer.last_order_date) {
              customer.last_order_date = orderData.order_date
            }
          }
        })

        setCustomers(Array.from(customerMap.values()))
      } catch (error) {
        console.error("Error fetching customers:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchQuery)
    )
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <AdminHeader
        title="Customers"
        description="View and manage your customer information"
      />

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search customers..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6">
          <div className="rounded-lg border bg-card">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium">Customer</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Contact</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Orders</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Total Spent</th>
                    <th className="h-12 px-4 text-left align-middle font-medium">Last Order</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      <td className="p-4 align-middle">
                        <div className="font-medium">{customer.name}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                            {customer.phone}
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            {customer.address}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">{customer.total_orders}</div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="font-medium">
                          {formatPriceInPKR(customer.total_spent)}
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="text-sm text-muted-foreground">
                          {customer.last_order_date.toDate().toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 