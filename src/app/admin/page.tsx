"use client";

import { useState, useEffect } from "react";
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockItems: number;
  revenueToday: number;
  ordersToday: number;
  revenueChart: { date: string; revenue: number; orders: number }[];
  topProducts: { id: string; name: string; revenue: number; unitsSold: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  const cards = [
    { title: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, className: "text-emerald-600" },
    { title: "Total Orders", value: stats?.totalOrders.toString() || "0", icon: ShoppingCart, className: "text-blue-600" },
    { title: "Customers", value: stats?.totalCustomers.toString() || "0", icon: Users, className: "text-violet-600" },
    { title: "Products", value: stats?.totalProducts.toString() || "0", icon: Package, className: "text-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-4 w-4" /> ${stats?.revenueToday.toFixed(0) || "0"} today</span>
          {stats && stats.lowStockItems > 0 && (
            <span className="flex items-center gap-1 text-amber-600"><AlertTriangle className="h-4 w-4" /> {stats.lowStockItems} low stock</span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 opacity-80 ${card.className}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Recent Revenue (30 days)</h3>
            {stats?.revenueChart && stats.revenueChart.length > 0 ? (
              <div className="space-y-2">
                {stats.revenueChart.slice(-14).map((day) => (
                  <div key={day.date} className="flex items-center gap-3 text-sm">
                    <span className="w-24 text-muted-foreground">{formatDate(day.date, { month: "short", day: "numeric" })}</span>
                    <div className="flex-1 h-5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${Math.min(100, (day.revenue / Math.max(...stats.revenueChart.map((d) => d.revenue))) * 100)}%` }}
                      />
                    </div>
                    <span className="w-20 text-right font-medium">${day.revenue.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Top Products</h3>
            {stats?.topProducts && stats.topProducts.length > 0 ? (
              <div className="space-y-3">
                {stats.topProducts.slice(0, 5).map((product, i) => (
                  <div key={product.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-5">{i + 1}.</span>
                      <span className="truncate max-w-[200px]">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(product.revenue)}</p>
                      <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
