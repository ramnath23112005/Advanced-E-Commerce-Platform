"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItemRow } from "@/components/cart/cart-item";
import { formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

export default function CartPage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/cart")
        .then((r) => r.json())
        .then((data) => setItems(data.items || []))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const updateQuantity = async (itemId: string, quantity: number) => {
    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, quantity }),
    });
    if (res.ok) {
      setItems((prev) =>
        prev.map((item: { id: string }) =>
          item.id === itemId ? { ...item, quantity } : item
        ).filter((item: { quantity: number }) => item.quantity > 0)
      );
    }
  };

  const removeItem = async (itemId: string) => {
    const res = await fetch("/api/cart", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) {
      setItems((prev) => prev.filter((item: { id: string }) => item.id !== itemId));
      toast.success("Item removed");
    }
  };

  const subtotal = items.reduce((sum: number, item: { product: { basePrice: number; salePrice: number | null }; quantity: number }) => {
    const price = item.product.salePrice || item.product.basePrice;
    return sum + Number(price) * item.quantity;
  }, 0);

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Cart is empty</h1>
        <p className="text-muted-foreground mb-6">Please sign in to view your cart</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-display">Shopping Cart</h1>
        <Link href="/products"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" /> Continue Shopping</Button></Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Start shopping to add items</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {items.map((item: { id: string }) => (
              <CartItemRow key={item.id} item={item} onUpdate={updateQuantity} onRemove={removeItem} />
            ))}
          </div>
          <div className="lg:col-span-1">
            <div className="rounded-xl border p-6 space-y-4 sticky top-24">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping</span><span>{subtotal >= 100 ? "Free" : "$9.99"}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>Calculated at checkout</span></div>
                <hr />
                <div className="flex justify-between font-semibold text-base">
                  <span>Estimated Total</span>
                  <span>{formatPrice(subtotal >= 100 ? subtotal : subtotal + 9.99)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full" size="lg">Proceed to Checkout</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
