"use client";

import { useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Star, Heart, ShoppingBag, Minus, Plus, Truck, Shield, RotateCcw } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/product/product-gallery";
import toast from "react-hot-toast";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  basePrice: number;
  salePrice: number | null;
  currency: string;
  sku: string;
  totalStock: number;
  averageRating: number;
  reviewCount: number;
  images: { id: string; url: string; altText: string | null; isPrimary: boolean }[];
  categories: { category: { id: string; name: string; slug: string } }[];
  variants: { id: string; name: string; price: number | null; stock: number }[];
}

export function ProductDetailClient({ product, reviews }: { product: ProductDetail; reviews: { id: string; rating: number; title: string | null; comment: string; createdAt: string; user: { name: string | null; image: string | null } }[] }) {
  const { data: session } = useSession();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const currentPrice = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price || product.basePrice
    : product.salePrice || product.basePrice;

  const hasDiscount = product.salePrice && product.salePrice < product.basePrice;

  const addToCart = async () => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, variantId: selectedVariant, quantity }),
      });
      if (!res.ok) throw new Error();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const addToWishlist = async () => {
    if (!session) { toast.error("Please sign in"); return; }
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
      const data = await res.json();
      toast.success(data.wishlisted ? "Added to wishlist" : "Removed from wishlist");
    } catch {
      toast.error("Failed to update wishlist");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <ProductGallery images={product.images} />

        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {product.categories.map((pc) => (
                <Badge key={pc.category.id} variant="default">
                  {pc.category.name}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold font-display sm:text-3xl">{product.name}</h1>
            {product.averageRating > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-4 w-4", i < Math.round(product.averageRating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(Number(currentPrice))}</span>
            {hasDiscount && (
              <span className="text-lg text-muted-foreground line-through">{formatPrice(Number(product.basePrice))}</span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-muted-foreground">{product.shortDescription}</p>
          )}

          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: product.description }} />

          {product.variants.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={cn(
                      "rounded-lg border px-4 py-2 text-sm transition-all",
                      selectedVariant === variant.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "hover:border-muted-foreground/30",
                      variant.stock === 0 && "opacity-50 cursor-not-allowed"
                    )}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                    {variant.price && ` - ${formatPrice(Number(variant.price))}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border rounded-lg">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-secondary rounded-l-lg transition-colors">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-12 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.totalStock || 99, quantity + 1))} className="p-2 hover:bg-secondary rounded-r-lg transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {product.totalStock > 0 ? (
              <span className="text-xs text-muted-foreground">{product.totalStock} in stock</span>
            ) : (
              <span className="text-xs text-destructive">Out of stock</span>
            )}
          </div>

          <div className="flex gap-3">
            <Button size="lg" className="flex-1" onClick={addToCart} isLoading={isAdding} disabled={product.totalStock === 0}>
              <ShoppingBag className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg" onClick={addToWishlist}>
              <Heart className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 rounded-xl border p-4">
            {[
              { icon: Truck, label: "Free Shipping", sub: "On orders over $100" },
              { icon: Shield, label: "Secure Checkout", sub: "SSL encrypted" },
              { icon: RotateCcw, label: "Easy Returns", sub: "30-day return policy" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <item.icon className="h-5 w-5 mx-auto text-primary" />
                <p className="text-xs font-medium mt-1">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold font-display mb-8">Customer Reviews</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn("h-3.5 w-3.5", i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.title && <h4 className="text-sm font-medium mb-1">{review.title}</h4>}
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-2">- {review.user.name || "Anonymous"}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
