import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfDay, subDays, format } from "date-fns";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const today = startOfDay(new Date());
    const thirtyDaysAgo = subDays(today, 30);

    const [revenueAgg, ordersAgg, totalCustomers, totalProducts, pendingOrders, lowStockItems, recentOrders] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "CAPTURED" } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count({ where: { totalStock: { lte: 5 }, isActive: true } }),
      prisma.order.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { total: true, createdAt: true, status: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const revenueByDay = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(today, i), "yyyy-MM-dd");
      revenueByDay.set(date, { revenue: 0, orders: 0 });
    }

    for (const order of recentOrders) {
      const date = format(new Date(order.createdAt), "yyyy-MM-dd");
      const existing = revenueByDay.get(date);
      if (existing) {
        existing.revenue += Number(order.total);
        existing.orders += 1;
      }
    }

    const todayOrders = recentOrders.filter(
      (o) => new Date(o.createdAt) >= today
    );

    const revenueToday = todayOrders.reduce((sum, o) => sum + Number(o.total), 0);

    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: "desc" } },
      take: 10,
    });

    const productIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    return NextResponse.json({
      totalRevenue: revenueAgg._sum.total || 0,
      totalOrders: ordersAgg,
      totalCustomers,
      totalProducts,
      pendingOrders,
      lowStockItems,
      revenueToday,
      ordersToday: todayOrders.length,
      revenueChart: Array.from(revenueByDay.entries()).map(([date, data]) => ({ date, ...data })),
      topProducts: topProducts.map((p) => ({
        id: p.productId,
        name: productMap.get(p.productId) || "Unknown",
        revenue: p._sum.totalPrice || 0,
        unitsSold: p._sum.quantity || 0,
      })),
      orderStatusDistribution: [
        { status: "PENDING", count: pendingOrders },
      ],
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
