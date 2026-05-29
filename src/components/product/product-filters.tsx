"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "popular", label: "Most Popular" },
];

const priceRanges = [
  { min: 0, max: 50, label: "Under $50" },
  { min: 50, max: 100, label: "$50 - $100" },
  { min: 100, max: 200, label: "$100 - $200" },
  { min: 200, max: 500, label: "$200 - $500" },
  { min: 500, max: undefined, label: "Over $500" },
];

const ratingOptions = [4, 3, 2, 1];

interface ProductFiltersProps {
  categories?: { id: string; name: string; slug: string }[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentRating = searchParams.get("rating") || "";

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4" />
        <span className="text-sm font-medium">Filters</span>
      </div>

      {categories && categories.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Category</h3>
          <div className="space-y-1">
            <button
              onClick={() => updateParams({ category: undefined })}
              className={cn("block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors", !currentCategory && "bg-primary/10 text-primary font-medium")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams({ category: cat.slug })}
                className={cn("block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors", currentCategory === cat.slug && "bg-primary/10 text-primary font-medium")}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Price Range</h3>
        <div className="space-y-1">
          {priceRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => updateParams({ minPrice: range.min.toString(), maxPrice: range.max?.toString() })}
              className={cn("block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors", currentMinPrice === range.min.toString() && "bg-primary/10 text-primary font-medium")}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Rating</h3>
        <div className="space-y-1">
          {ratingOptions.map((rating) => (
            <button
              key={rating}
              onClick={() => updateParams({ rating: rating.toString() })}
              className={cn("block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors", currentRating === rating.toString() && "bg-primary/10 text-primary font-medium")}
            >
              {rating}+ Stars
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => router.push("/products")}
      >
        Clear All Filters
      </Button>
    </div>
  );
}
