"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { searchProducts } from "@/lib/firebase/firestore"
import ProductSearchResult from "./product-search-result"
import type { ProductType } from "@/types/product"

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<ProductType[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState("")

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await searchProducts(debouncedQuery)
        setSearchResults(results)
      } catch (error) {
        console.error("Error searching products:", error)
      } finally {
        setIsSearching(false)
      }
    }

    performSearch()
  }, [debouncedQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      onOpenChange(false)
    }
  }

  const handleResultClick = (slug: string) => {
    router.push(`/products/${slug}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Search Products</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search for products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <Button type="submit" className="sr-only">
            Search
          </Button>
        </form>
        <div className="mt-4 max-h-[300px] overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((product) => (
                <ProductSearchResult
                  key={product.productId}
                  product={product}
                  onClick={() => handleResultClick(product.slug)}
                />
              ))}
              {searchResults.length > 5 && (
                <Button variant="ghost" className="w-full text-sm" onClick={handleSearch}>
                  View all {searchResults.length} results
                </Button>
              )}
            </div>
          ) : debouncedQuery ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No products found</p>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
