"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  salePrice: number | null;
  totalStock: number;
  isActive: boolean;
  isFeatured: boolean;
  _count: { orderItems: number; reviews: number };
  images: { url: string }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new"><Button><Plus className="h-4 w-4 mr-1" /> Add Product</Button></Link>
      </div>

      {isLoading ? <TableSkeleton /> : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-4 font-medium">Product</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium">Stock</th>
                <th className="text-left p-4 font-medium">Sales</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="w-10 p-4" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden flex-shrink-0" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">{formatPrice(Number(p.salePrice || p.basePrice))}</td>
                  <td className="p-4"><span className={p.totalStock <= 5 ? "text-amber-600 font-medium" : ""}>{p.totalStock}</span></td>
                  <td className="p-4">{p._count.orderItems}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {p.isFeatured && <Badge variant="info">Featured</Badge>}
                      {!p.isActive && <Badge variant="danger">Inactive</Badge>}
                    </div>
                  </td>
                  <td className="p-4"><Pencil className="h-4 w-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
