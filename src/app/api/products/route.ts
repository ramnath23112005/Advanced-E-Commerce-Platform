import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
    const rating = searchParams.get("rating") ? Number(searchParams.get("rating")) : undefined;
    const featured = searchParams.get("featured") === "true";

    if (redis) {
      const cacheKey = CACHE_KEYS.products(searchParams.toString());
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(JSON.parse(cached), {
          headers: { "X-Cache": "HIT" },
        });
      }
    }

    const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (categorySlug) {
      where.categories = {
        some: { category: { slug: categorySlug } },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.basePrice = {};
      if (minPrice !== undefined) (where.basePrice as Record<string, unknown>).gte = minPrice;
      if (maxPrice !== undefined) (where.basePrice as Record<string, unknown>).lte = maxPrice;
    }

    if (rating !== undefined) {
      where.averageRating = { gte: rating };
    }

    if (featured) {
      where.isFeatured = true;
    }

    const orderBy: Record<string, string>[] = [];
    switch (sort) {
      case "price-asc": orderBy.push({ basePrice: "asc" }); break;
      case "price-desc": orderBy.push({ basePrice: "desc" }); break;
      case "rating": orderBy.push({ averageRating: "desc" }); break;
      case "popular": orderBy.push({ reviewCount: "desc" }); break;
      default: orderBy.push({ createdAt: "desc" });
    }

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    const response = {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    if (redis) {
      const cacheKey = CACHE_KEYS.products(searchParams.toString());
      await redis.setex(cacheKey, CACHE_TTL.PRODUCT, JSON.stringify(response));
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
