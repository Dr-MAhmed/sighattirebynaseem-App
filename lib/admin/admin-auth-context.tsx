"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Cookies from 'js-cookie'

// Define the admin user type
export interface AdminUser {
  id: string
  email: string
  name: string
  role: "admin"
}

// Use environment variables for admin credentials
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@sighattire.com"
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Admin@123"
const ADMIN_NAME = process.env.NEXT_PUBLIC_ADMIN_NAME || "Admin User"
const ADMIN_ID = process.env.NEXT_PUBLIC_ADMIN_ID || "admin-user-1"

// Define the context type
interface AdminAuthContextType {
  adminUser: AdminUser | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
}

// Create the context
const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

// Create the provider component
export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Check if user is logged in on mount
  useEffect(() => {
    // Try to get admin user from cookie first, then localStorage as fallback
    const cookieUser = Cookies.get('adminUser')
    const storedUser = localStorage.getItem("adminUser")
    
    if (cookieUser) {
      try {
        setAdminUser(JSON.parse(cookieUser))
      } catch (e) {
        console.error("Failed to parse admin user from cookie", e)
      }
    } else if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setAdminUser(parsedUser)
        // Also set the cookie if we found the user in localStorage
        Cookies.set('adminUser', storedUser, { 
          expires: 7, 
          path: '/',
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production'
        })
      } catch (e) {
        console.error("Failed to parse admin user from localStorage", e)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading) {
      if (!adminUser && pathname?.startsWith("/admin") && pathname !== "/login") {
        router.push("/login")
      }
    }
  }, [adminUser, isLoading, pathname, router])

  // Placeholder for Firebase Auth admin check (for future production hardening)
  // In production, check Firebase Auth custom claims for admin role
  const signIn = async (email: string, password: string) => {
    // Check against environment variables
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user: AdminUser = {
        id: ADMIN_ID,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: "admin",
      }
      setAdminUser(user)
      
      // Store in both localStorage and cookies
      const userString = JSON.stringify(user)
      localStorage.setItem("adminUser", userString)
      
      // Set the cookie with proper attributes to ensure it's accessible server-side
      Cookies.set('adminUser', userString, { 
        expires: 7, 
        path: '/',
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
      })
      
      // Also set a simple flag cookie that's easier for middleware to check
      document.cookie = `adminAuthenticated=true; path=/; max-age=${60*60*24*7}; samesite=strict; ${process.env.NODE_ENV === 'production' ? 'secure;' : ''}`
      
      return { success: true, message: "Login successful" }
    }
    return { success: false, message: "Invalid email or password" }
  }

  // Logout function
  const logout = () => {
    setAdminUser(null)
    localStorage.removeItem("adminUser")
    Cookies.remove('adminUser', { path: '/' })
    
    // Also remove the flag cookie
    document.cookie = "adminAuthenticated=; path=/; max-age=0;"
    
    router.push("/login")
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, isLoading, signIn, logout }}>{children}</AdminAuthContext.Provider>
  )
}

// Create a hook to use the context
export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
