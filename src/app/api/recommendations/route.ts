import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET() {
  try {
    if (redis) {
      const cached = await redis.get(CACHE_KEYS.featured);
      if (cached) {
        return NextResponse.json(JSON.parse(cached));
      }
    }

    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { averageRating: "desc" },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    });

    if (redis) {
      await redis.setex(CACHE_KEYS.featured, CACHE_TTL.PRODUCT, JSON.stringify(products));
    }

    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
