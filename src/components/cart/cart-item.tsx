"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      salePrice: number | null;
      totalStock: number;
      images: { url: string; altText: string | null }[];
    };
    variant: { name: string; price: number | null } | null;
  };
  onUpdate: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
}

export function CartItemRow({ item, onUpdate, onRemove }: CartItemProps) {
  const price = item.product.salePrice || item.product.basePrice;
  const image = item.product.images[0];

  return (
    <div className="flex gap-4 py-4 border-b">
      <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
        {image && (
          <Image
            src={image.url}
            alt={image.altText || item.product.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex justify-between">
          <div>
            <Link href={`/products/${item.product.slug}`} className="text-sm font-medium hover:underline">
              {item.product.name}
            </Link>
            {item.variant && <p className="text-xs text-muted-foreground">{item.variant.name}</p>}
          </div>
          <p className="text-sm font-semibold">{formatPrice(Number(price))}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdate(item.id, Math.max(1, item.quantity - 1))}
              className="rounded-lg border p-1 hover:bg-secondary transition-colors"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <button
              onClick={() => onUpdate(item.id, Math.min(item.product.totalStock, item.quantity + 1))}
              className="rounded-lg border p-1 hover:bg-secondary transition-colors"
              disabled={item.quantity >= item.product.totalStock}
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <button
            onClick={() => onRemove(item.id)}
            className="text-muted-foreground hover:text-destructive transition-colors p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
