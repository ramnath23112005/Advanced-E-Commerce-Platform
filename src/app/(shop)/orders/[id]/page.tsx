"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning", CONFIRMED: "info", PROCESSING: "info",
  SHIPPED: "default", DELIVERED: "success", CANCELLED: "danger", RETURNED: "danger",
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  paymentStatus: string;
  trackingNumber: string | null;
  createdAt: string;
  items: { id: string; name: string; price: number; quantity: number; totalPrice: number; imageUrl: string | null }[];
  statusHistory: { status: string; createdAt: string; note: string | null }[];
}

const statusSteps = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export default function OrderDetailPage() {
  const params = useParams();
  const { data: session } = useSession();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) { setIsLoading(false); return; }
    fetch(`/api/orders/${params.id}`)
      .then(r => r.json())
      .then(setOrder)
      .finally(() => setIsLoading(false));
  }, [session, params.id]);

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 py-8 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;
  if (!order) return <div className="mx-auto max-w-3xl px-4 py-20 text-center"><Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h1 className="text-xl font-bold">Order not found</h1></div>;

  const currentStepIndex = statusSteps.indexOf(order.status);
  const [cancelledOrReturned] = ["CANCELLED", "RETURNED"].filter(s => s === order.status);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/orders" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Orders
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Order {order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <Badge variant={statusColors[order.status] || "default"} className="text-sm px-3 py-1">{order.status}</Badge>
      </div>

      {!cancelledOrReturned && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {statusSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  i <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className="text-xs mt-1 text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-muted" />
                )}
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-muted-foreground">Qty: {item.quantity}</p>
                </div>
              </div>
              <span>{formatPrice(Number(item.totalPrice))}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-6 mb-6">
        <h2 className="font-semibold mb-4">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>{order.shippingCost === 0 ? "Free" : formatPrice(Number(order.shippingCost))}</span></div>
          <div className="flex justify-between"><span>Tax</span><span>{formatPrice(Number(order.taxAmount))}</span></div>
          {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(Number(order.discountAmount))}</span></div>}
          <hr />
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
        </div>
      </div>

      {order.statusHistory.length > 0 && (
        <div className="rounded-xl border p-6">
          <h2 className="font-semibold mb-4">Status History</h2>
          <div className="space-y-3">
            {order.statusHistory.map((h) => (
              <div key={h.createdAt} className="flex items-start gap-3 text-sm">
                <Badge variant={statusColors[h.status] || "default"}>{h.status}</Badge>
                <div>
                  <p className="text-muted-foreground">{h.note}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(h.createdAt, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
