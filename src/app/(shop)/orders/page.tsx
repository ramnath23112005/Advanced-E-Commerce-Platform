"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/utils";

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  CONFIRMED: "info", PROCESSING: "info", SHIPPED: "default",
  DELIVERED: "success", CANCELLED: "danger", RETURNED: "danger",
};

export default function OrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState<{ id: string; orderNumber: string; status: string; total: number; createdAt: string; items: { id: string; name: string }[] }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session) { setIsLoading(false); return; }
    fetch("/api/orders").then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setIsLoading(false));
  }, [session]);

  if (!session) return <div className="mx-auto max-w-7xl px-4 py-20 text-center"><h1 className="text-2xl font-bold mb-4">Sign in to view orders</h1><Link href="/login"><Button>Sign In</Button></Link></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold font-display mb-8">Order History</h1>
      {isLoading ? (
        <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20"><Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">No orders yet</h2><p className="text-muted-foreground mb-6">Start shopping</p><Link href="/products"><Button>Browse Products</Button></Link></div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="block rounded-xl border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs">{order.orderNumber}</span>
                <Badge variant={statusColors[order.status] || "default"}>{order.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                <span className="font-semibold">{formatPrice(Number(order.total))}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
