"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const statusColors: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "info",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "danger",
  RETURNED: "danger",
};

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  user: { name: string | null; email: string | null };
  items: { id: string; name: string; quantity: number }[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => setOrders(d.orders || []))
      .finally(() => setIsLoading(false));
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    if (res.ok) {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
      toast.success(`Order ${status.toLowerCase()}`);
    }
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Order</th>
              <th className="text-left p-4 font-medium">Customer</th>
              <th className="text-left p-4 font-medium">Total</th>
              <th className="text-left p-4 font-medium">Status</th>
              <th className="text-left p-4 font-medium">Payment</th>
              <th className="text-left p-4 font-medium">Date</th>
              <th className="text-left p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4 font-mono text-xs">{order.orderNumber}</td>
                <td className="p-4">{order.user.name || order.user.email || "N/A"}</td>
                <td className="p-4 font-medium">{formatPrice(Number(order.total))}</td>
                <td className="p-4"><Badge variant={statusColors[order.status] || "default"}>{order.status}</Badge></td>
                <td className="p-4"><Badge variant={order.paymentStatus === "CAPTURED" ? "success" : "warning"}>{order.paymentStatus}</Badge></td>
                <td className="p-4 text-muted-foreground">{formatDate(order.createdAt)}</td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="rounded-lg border px-2 py-1 text-xs"
                  >
                    {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
