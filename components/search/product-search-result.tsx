"use client"

import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import type { ProductType } from "@/types/product"

interface ProductSearchResultProps {
  product: ProductType
  onClick: () => void
}

export default function ProductSearchResult({ product, onClick }: ProductSearchResultProps) {
  return (
    <div className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-accent" onClick={onClick}>
      <div className="relative h-12 w-12 overflow-hidden rounded-md">
        <Image
          src={(product.images?.[0]?.url) || "/placeholder.svg?height=48&width=48"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{product.name}</h3>
        <p className="text-xs text-muted-foreground capitalize">{product.category_id?.replace(/-/g, " ")}</p>
      </div>
      <div className="text-right">
        {product.sale_price && product.sale_price > 0 && product.sale_price !== null && product.sale_price !== undefined ? (
          <div>
            <span className="text-sm font-medium text-muted-foreground line-through">
              {formatCurrency(product.price)}
            </span>
            <span className="ml-1 text-sm font-medium text-primary">
              {formatCurrency(product.sale_price)}
            </span>
          </div>
        ) : (
          <span className="text-sm font-medium text-primary">{formatCurrency(product.price)}</span>
        )}
      </div>
    </div>
  )
}
