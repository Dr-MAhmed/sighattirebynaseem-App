"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWishlist } from "@/lib/store/wishlist-actions";
import ProductCard from "@/components/product/product-card";
import type { ProductType } from "@/types/product";
import { useFilteredProducts } from "@/lib/hooks/use-filtered-products";
import { getAllProducts, searchProducts } from "@/lib/firebase/firestore";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<ProductType[]>([]);
  const { wishlistItems, addToWishlist } = useWishlist();

  const {
    products,
    filteredProducts,
    priceRange,
    setPriceRange,
    selectedAttributes,
    handleAttributeChange,
    sortOption,
    setSortOption,
    allAttributes,
    resetFilters,
  } = useFilteredProducts(searchResults);

  const handleAddToWishlist = (product: ProductType) => {
    addToWishlist(product.productId!, product);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const products = await searchProducts(query);
        setSearchResults(products);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  if (loading) {
    return (
      <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 rounded-full animate-spin border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Search Results</h1>
        <p className="max-w-3xl mt-2 text-muted-foreground">
          {query
            ? searchResults.length > 0
              ? `Found ${searchResults.length} results for "${query}"`
              : `No results found for "${query}"`
            : "Please enter a search term to find products"}
        </p>
      </div>

      {searchResults.length > 0 && (
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Filters - Desktop */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="mb-4 text-sm font-medium">Price Range</h3>
                  <Slider
                    value={priceRange}
                    min={0}
                    max={10000}
                    step={100}
                    onValueChange={setPriceRange}
                    className="py-4"
                  />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span>Rs. {priceRange[0]}</span>
                    <span>Rs. {priceRange[1]}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="mb-4 text-sm font-medium">Category</h3>
                  <div className="space-y-2">
                    {[
                      "everyday-wear",
                      "formal",
                      "occasion",
                      "best-sellers",
                    ].map((category) => (
                      <div
                        key={category}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`category-${category}`}
                          checked={
                            selectedAttributes["category_id"]?.includes(
                              category
                            ) || false
                          }
                          onCheckedChange={(checked) =>
                            handleAttributeChange(
                              "category_id",
                              category,
                              checked as boolean
                            )
                          }
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm capitalize"
                        >
                          {category.replace(/-/g, " ")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {Object.entries(allAttributes)
                  .filter(([key]) => key !== "category_id")
                  .map(([attributeName, values]) => (
                    <div key={attributeName}>
                      <h3 className="mb-4 text-sm font-medium">
                        {attributeName}
                      </h3>
                      <div className="space-y-2">
                        {values.map((value) => (
                          <div
                            key={value}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`${attributeName}-${value}`}
                              checked={
                                selectedAttributes[attributeName]?.includes(
                                  value
                                ) || false
                              }
                              onCheckedChange={(checked) =>
                                handleAttributeChange(
                                  attributeName,
                                  value,
                                  checked as boolean
                                )
                              }
                            />
                            <Label
                              htmlFor={`${attributeName}-${value}`}
                              className="text-sm"
                            >
                              {value}
                            </Label>
                          </div>
                        ))}
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div>
                    <h3 className="mb-4 text-sm font-medium">Price Range</h3>
                    <Slider
                      value={priceRange}
                      min={0}
                      max={10000}
                      step={100}
                      onValueChange={setPriceRange}
                    />
                    <div className="flex items-center justify-between mt-2 text-sm">
                      <span>Rs. {priceRange[0]}</span>
                      <span>Rs. {priceRange[1]}</span>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="mb-4 text-sm font-medium">Category</h3>
                    <div className="space-y-2">
                      {[
                        "everyday-wear",
                        "formal",
                        "occasion",
                        "best-sellers",
                      ].map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`mobile-category-${category}`}
                            checked={
                              selectedAttributes["category_id"]?.includes(
                                category
                              ) || false
                            }
                            onCheckedChange={(checked) =>
                              handleAttributeChange(
                                "category_id",
                                category,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={`mobile-category-${category}`}
                            className="text-sm capitalize"
                          >
                            {category.replace(/-/g, " ")}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {Object.entries(allAttributes)
                    .filter(([key]) => key !== "category_id")
                    .map(([attributeName, values]) => (
                      <div key={attributeName}>
                        <h3 className="mb-4 text-sm font-medium">
                          {attributeName}
                        </h3>
                        <div className="space-y-2">
                          {values.map((value) => (
                            <div
                              key={value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`mobile-${attributeName}-${value}`}
                                checked={
                                  selectedAttributes[attributeName]?.includes(
                                    value
                                  ) || false
                                }
                                onCheckedChange={(checked) =>
                                  handleAttributeChange(
                                    attributeName,
                                    value,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`mobile-${attributeName}-${value}`}
                                className="text-sm"
                              >
                                {value}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <Separator className="mt-4" />
                      </div>
                    ))}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button>Apply Filters</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </p>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Sort by:</span>
                <Select value={sortOption} onValueChange={setSortOption}>
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="price-low-high">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="price-high-low">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center border rounded-lg bg-card">
                <h2 className="text-xl font-medium">No products found</h2>
                <p className="mt-2 text-muted-foreground">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    isInWishlist={wishlistItems.some(
                      (item) => item.product_id === product.productId
                    )}
                    onAddToWishlist={() => handleAddToWishlist(product)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {searchResults.length === 0 && query && (
        <div className="p-8 text-center border rounded-lg bg-card">
          <h2 className="text-xl font-medium">No products found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn't find any products matching "{query}". Try different
            keywords or browse our categories.
          </p>
          <Button asChild className="mt-4">
            <a href="/products">Browse All Products</a>
          </Button>
        </div>
      )}

      {!query && (
        <div className="p-8 text-center border rounded-lg bg-card">
          <h2 className="text-xl font-medium">Enter a search term</h2>
          <p className="mt-2 text-muted-foreground">
            Please enter a search term in the search box to find products.
          </p>
          <Button asChild className="mt-4">
            <a href="/products">Browse All Products</a>
          </Button>
        </div>
      )}
    </div>
  );
}
