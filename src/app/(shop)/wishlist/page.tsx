"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/product-grid";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((d) => setItems(d.items.map((i: { product: unknown }) => i.product)))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session]);

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Wishlist</h1>
        <p className="text-muted-foreground mb-6">Sign in to view your wishlist</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold font-display mb-8">Your Wishlist</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-6">Save items you love</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
