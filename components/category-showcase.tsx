"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CategoryType } from "@/types/category";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategories } from "../lib/firebase/firestore";

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const itemWidth = scrollContainerRef.current.offsetWidth / 2; // Width of one item on mobile
      const scrollAmount = direction === "left" ? -itemWidth : itemWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const fetchedCategories = await getCategories();

        // Filter categories to only include the allowed ones
        const allowedCategoryNames = [
          "New Arrivals",
          "Abayas",
          "Modest Maxi & Dresses",
          "Prayer / Namaz Chadar",
          "Irani Chadar",
          "Hijabs",
          "Essentials",
        ];

        // Category images mapping
        const categoryImages: Record<string, string> = {
          "New Arrivals": "/arrivalscatt.png",
          Abayas: "/abayacatt.png",
          "Modest Maxi & Dresses": "/dresscatt.png",
          "Prayer / Namaz Chadar": "/namazchadarcatt.png",
          "Irani Chadar": "/iranichadarcatt.png",
          Hijabs: "/hijabicon2.png",
          Essentials: "/essentialscatt.png",
        };

        let filteredCategories = fetchedCategories
          .filter((cat: CategoryType) =>
            allowedCategoryNames.includes(cat.name)
          )
          .map((cat: CategoryType) => ({
            ...cat,
            image: categoryImages[cat.name] || cat.image,
          }))
          // Remove duplicates by checking the first occurrence of each category name
          .filter(
            (cat: CategoryType, idx: number, arr: CategoryType[]) =>
              arr.findIndex((c) => c.name === cat.name) === idx
          );
        // Explicitly sort categories to match the allowedCategoryNames order
        filteredCategories = filteredCategories.sort(
          (a: CategoryType, b: CategoryType) =>
            allowedCategoryNames.indexOf(a.name) -
            allowedCategoryNames.indexOf(b.name)
        );
        setCategories(filteredCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    // Show 7 skeletons to match the number of categories
    return (
      <section className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Shop By Categories</h2>
          <div className="select-none text-md text-muted-foreground opacity-60">
            View All
          </div>
        </div>
        <div className="relative">
          <div className="flex px-4 pb-4 -mx-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center rounded-lg border bg-card p-6 text-center mr-2 last:mr-0"
              >
                <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-full" />
                <Skeleton className="w-32 h-6 mx-auto mb-2 rounded" />
                <Skeleton className="w-40 h-4 mx-auto rounded" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-60"
              disabled
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full opacity-60"
              disabled
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </section>
    );
  }
  if (error)
    return <div className="py-12 text-center text-red-500">{error}</div>;
  if (!categories.length) return null;

  return (
    <section className="container px-4 py-12 mx-auto md:px-6 lg:py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Shop By Categories</h2>
        <Link
          prefetch
          href="/products"
          className="text-md text-muted-foreground hover:underline"
        >
          View All
        </Link>
      </div>
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex px-4 pb-4 -mx-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:mx-0 md:px-0 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-4"
        >
          {categories.map((category) => (
            <Link
              prefetch
              key={category.categoryId}
              href={`/categories/${category.slug}`}
              className="flex-none w-[calc(50%-0.5rem)] md:w-auto snap-center rounded-lg border bg-card p-6 text-center hover:shadow-lg transition mr-2 last:mr-0"
            >
              <img
                src={category.image}
                alt={category.name}
                className="object-cover w-32 h-32 mx-auto mb-4 rounded-full lg:h-64 lg:w-64"
              />
              <h3 className="text-lg font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </Link>
          ))}
        </div>
        <div className="flex justify-center gap-4 mt-4 md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
