import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/product-grid";

async function getFeaturedProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/products?featured=true&limit=8&sort=rating`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.items || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="min-h-screen">
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl font-display text-balance">
            Discover Your Perfect Style
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Curated collections of premium products designed for those who appreciate the finer things in life.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link href="/products">
              <Button size="lg" className="text-base px-8">Shop Now</Button>
            </Link>
            <Link href="/category/new-arrivals">
              <Button variant="outline" size="lg" className="text-base px-8">New Arrivals</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl font-bold font-display sm:text-3xl">Featured Products</h2>
            <p className="mt-2 text-muted-foreground">Handpicked favorites just for you</p>
          </div>
          <Link href="/products">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        {featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        )}
      </section>

      <section className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { title: "Free Shipping", description: "On orders over $100" },
              { title: "Secure Payments", description: "128-bit SSL encryption" },
              { title: "Easy Returns", description: "30-day return policy" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-6 text-center">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
