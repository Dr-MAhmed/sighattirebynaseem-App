import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AdminProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side authentication check
  const cookieStore = await cookies()
  const isAdminAuthenticated = cookieStore.has('adminAuthenticated') && 
                              cookieStore.get('adminAuthenticated')?.value === 'true'
  
  // If not authenticated, redirect to login
  if (!isAdminAuthenticated) {
    redirect('/login?redirect=/admin/products')
  }
  
  return <>{children}</>
} 