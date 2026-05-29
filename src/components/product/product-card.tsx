"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOptimistic } from "react";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  averageRating: number;
  reviewCount: number;
  totalStock: number;
  isFeatured?: boolean;
  images: { url: string; altText: string | null }[];
  categories?: { category: { name: string; slug: string } }[];
}

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const [isWishlisted, setIsWishlisted] = useOptimistic(false);

  const image = product.images?.[0];
  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount ? calculateDiscount(Number(product.basePrice), Number(product.salePrice)) : 0;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      setIsWishlisted(data.wishlisted);
      toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="animate-fade-in-up">
        <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No image
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.isFeatured && <Badge variant="info">Featured</Badge>}
            {hasDiscount && <Badge variant="danger">-{discountPercent}%</Badge>}
          </div>
          {product.totalStock === 0 && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <span className="text-sm font-medium">Out of Stock</span>
            </div>
          )}
          <button
            onClick={toggleWishlist}
            className={cn(
              "absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background",
              isWishlisted && "opacity-100"
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-red-500 text-red-500")} />
          </button>
        </div>
        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1">
            {product.averageRating > 0 && (
              <>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-xs text-muted-foreground">
                  {product.averageRating.toFixed(1)} ({product.reviewCount})
                </span>
              </>
            )}
          </div>
          <h3 className="text-sm font-medium truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-semibold">{formatPrice(Number(product.salePrice))}</span>
                <span className="text-xs text-muted-foreground line-through">{formatPrice(Number(product.basePrice))}</span>
              </>
            ) : (
              <span className="text-sm font-semibold">{formatPrice(Number(product.basePrice))}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
