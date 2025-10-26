"use client"

import { useAdminAuth } from "@/lib/admin/admin-auth-context"
import { AdminHeader } from "@/components/admin/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminTestPage() {
  const { adminUser } = useAdminAuth()

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black dark:text-white">
      <AdminHeader />
      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
            Admin Test Page
          </h1>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Protected Admin Route Test</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  If you can see this page, you are authenticated as an admin.
                </p>
                <p className="mt-2">
                  Logged in as: {adminUser?.name} ({adminUser?.email})
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 