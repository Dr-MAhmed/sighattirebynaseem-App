"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addNewsletterSubscription } from "@/lib/firebase/firestore"
import { sendNewsletterSubscriptionEmail } from "@/lib/email/newsletter-email"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function NewsletterSignup() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      // Add subscription to Firestore
      await addNewsletterSubscription(email)
      
      // Send email notification to admin
      const emailResult = await sendNewsletterSubscriptionEmail(email)
      if (!emailResult.success) {
        console.error("Failed to send admin notification:", emailResult.error)
      }

      toast.success("Congratulations! You have successfully subscribed to stay updated for our exclusives offers, new arrivals and styling tips", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      setEmail("")
    } catch (error: any) {
      toast.error(error.message || "There was an error subscribing to the newsletter. Please try again.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="bg-primary/10 py-12 dark:bg-primary/20">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Stay Updated</h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Subscribe to our newsletter for exclusive offers, new arrivals, and styling tips.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </div>
      <ToastContainer />
    </section>
  )
}
