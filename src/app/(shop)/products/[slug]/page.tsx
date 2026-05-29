import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "./client";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, seoTitle: true, seoDescription: true, description: true },
  });
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      categories: { include: { category: true } },
      variants: { where: { isActive: true } },
    },
  });

  if (!product) notFound();

  const reviews = await prisma.review.findMany({
    where: { productId: product.id, isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: { user: { select: { name: true, image: true } } },
  });

  return <ProductDetailClient product={product} reviews={reviews} />;
}
