import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { ProductFilters } from "@/components/product/product-filters";
import { parseSearchParams } from "@/lib/utils";
import { redis, CACHE_KEYS, CACHE_TTL } from "@/lib/redis";

async function getProducts(searchParams: Record<string, string>) {
  const { search, category, minPrice, maxPrice, sort, page, limit, rating } = parseSearchParams(new URLSearchParams(searchParams));

  const cacheKey = CACHE_KEYS.products(JSON.stringify(searchParams));
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const where: Record<string, unknown> = { isActive: true };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

  if (category) {
    where.categories = { some: { category: { slug: category } } };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) (where.basePrice as Record<string, unknown>).gte = minPrice;
    if (maxPrice !== undefined) (where.basePrice as Record<string, unknown>).lte = maxPrice;
  }

  if (rating !== undefined) {
    where.averageRating = { gte: rating };
  }

  const orderBy: Record<string, string>[] = [];
  switch (sort) {
    case "price-asc": orderBy.push({ basePrice: "asc" }); break;
    case "price-desc": orderBy.push({ basePrice: "desc" }); break;
    case "rating": orderBy.push({ averageRating: "desc" }); break;
    case "popular": orderBy.push({ reviewCount: "desc" }); break;
    default: orderBy.push({ createdAt: "desc" });
  }

  const [items, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: { where: { isPrimary: true }, take: 1, select: { url: true, altText: true } },
        categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
      },
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const result = { items, total, page, limit, totalPages, categories };

  await redis.setex(cacheKey, CACHE_TTL.PRODUCT, JSON.stringify(result));

  return result;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const { items, total, page, limit, totalPages, categories } = await getProducts(params);
  const q = params.q || "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">
          {q ? `Search: "${q}"` : "All Products"}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {total} product{total !== 1 ? "s" : ""} found
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="hidden lg:block">
          <ProductFilters categories={categories} />
        </aside>
        <div className="lg:col-span-3">
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid products={items} />
          </Suspense>
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
                const p = i + 1;
                const sp = new URLSearchParams();
                Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v); });
                sp.set("page", p.toString());
                return (
                  <a
                    key={p}
                    href={`/products?${href.toString()}`}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-colors ${
                      p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
