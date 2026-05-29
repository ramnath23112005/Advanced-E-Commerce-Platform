"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [addresses, setAddresses] = useState<{ id: string; label: string; line1: string; city: string; state: string; postalCode: string; isDefault: boolean }[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [cartItems, setCartItems] = useState<{ product: { basePrice: number; salePrice: number | null }; quantity: number }[]>([]);

  useEffect(() => {
    if (!session) { router.push("/login"); return; }
    fetch("/api/cart").then(r => r.json()).then(d => setCartItems(d.items || []));
    fetch("/api/addresses").then(r => r.json()).then(d => {
      if (d.addresses?.length > 0) {
        setAddresses(d.addresses);
        const defaultAddr = d.addresses.find((a: { isDefault: boolean }) => a.isDefault) || d.addresses[0];
        setSelectedAddress(defaultAddr.id);
      }
    });
  }, [session, router]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error("Please select a shipping address"); return; }
    setIsProcessing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddressId: selectedAddress, couponCode: couponCode || undefined }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setStep("payment");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const subtotal = cartItems.reduce((sum: number, item: { product: { basePrice: number; salePrice: number | null }; quantity: number }) => {
    return sum + Number(item.product.salePrice || item.product.basePrice) * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold font-display mb-8">Checkout</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {step === "shipping" ? (
            <div className="rounded-xl border p-6 space-y-4">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
              {addresses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No saved addresses. Add one in your account.</p>
              ) : (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label key={addr.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-secondary/50 transition-colors">
                      <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                      <div className="text-sm">
                        <p className="font-medium">{addr.label}</p>
                        <p className="text-muted-foreground">{addr.line1}, {addr.city}, {addr.state} {addr.postalCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <div className="flex gap-2 mt-1">
                  <Input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Enter coupon" />
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={handlePlaceOrder} isLoading={isProcessing}>
                Place Order
              </Button>
            </div>
          ) : clientSecret && orderId ? (
            <div className="rounded-xl border p-6">
              <h2 className="text-lg font-semibold mb-4">Payment</h2>
              <CheckoutForm clientSecret={clientSecret} orderId={orderId} />
            </div>
          ) : null}
        </div>
        <div className="lg:col-span-1">
          <div className="rounded-xl border p-6 space-y-3 sticky top-24">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span>Subtotal ({cartItems.length} items)</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{subtotal >= 100 ? "Free" : "$9.99"}</span></div>
              <hr />
              <div className="flex justify-between font-semibold text-base">
                <span>Total</span>
                <span>{formatPrice(subtotal >= 100 ? subtotal : subtotal + 9.99)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
