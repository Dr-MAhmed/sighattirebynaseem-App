"use client"

import { useState, useMemo } from "react"
import type { ProductType } from "@/types/product"

export function useFilteredProducts(products: ProductType[] = []) {
  const [priceRange, setPriceRange] = useState([0, 20000])
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({})
  const [sortOption, setSortOption] = useState("newest")

  // Get all unique attributes from products
  const allAttributes: Record<string, string[]> = useMemo(() => {
    const attributes: Record<string, string[]> = {}

    if (!products || !Array.isArray(products)) {
      return attributes;
    }

    products.forEach((product) => {
      // Add product attributes
      if (product?.attributes) {
        Object.entries(product.attributes).forEach(([key, values]) => {
          if (!attributes[key]) {
            attributes[key] = []
          }
          if (Array.isArray(values)) {
            values.forEach((value) => {
              if (!attributes[key].includes(value)) {
                attributes[key].push(value)
              }
            })
          }
        })
      }
    })

    return attributes
  }, [products])

  const handleAttributeChange = (attributeName: string, value: string, checked: boolean) => {
    setSelectedAttributes((prev) => {
      const current = prev[attributeName] || []
      if (checked) {
        return { ...prev, [attributeName]: [...current, value] }
      } else {
        return { ...prev, [attributeName]: current.filter((v) => v !== value) }
      }
    })
  }

  const resetFilters = () => {
    setPriceRange([0, 20000])
    setSelectedAttributes({})
    setSortOption("newest")
  }

  // Apply filters and sorting
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    let filtered = [...products]

    // Filter by price
    filtered = filtered.filter((product) => {
      const price = product?.sale_price || product?.price || 0
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // Filter by attributes
    Object.entries(selectedAttributes).forEach(([key, values]) => {
      if (values.length > 0) {
        filtered = filtered.filter((product) => {
          if (!product?.attributes || !product.attributes[key]) return false
          return values.some((value) => product.attributes![key].includes(value))
        })
      }
    })

    // Sort products
    switch (sortOption) {
      case "price-low-high":
        filtered.sort((a, b) => ((a?.sale_price || a?.price || 0) - (b?.sale_price || b?.price || 0)))
        break
      case "price-high-low":
        filtered.sort((a, b) => ((b?.sale_price || b?.price || 0) - (a?.sale_price || a?.price || 0)))
        break
      case "rating":
        filtered.sort((a, b) => ((b?.avg_rating || 0) - (a?.avg_rating || 0)))
        break
      case "newest":
      default:
        // In a real app, you'd sort by date
        filtered.sort((a, b) => {
          if (a?.created_at && b?.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          return 0
        })
        break
    }

    return filtered
  }, [products, priceRange, selectedAttributes, sortOption])

  return {
    products: products || [],
    filteredProducts: filteredProducts || [],
    priceRange,
    setPriceRange,
    selectedAttributes,
    handleAttributeChange,
    sortOption,
    setSortOption,
    allAttributes,
    resetFilters,
  }
}
