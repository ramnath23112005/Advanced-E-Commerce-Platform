"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/skeleton";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/coupons").then(r => r.json()).then(d => setCoupons(d.coupons || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <Button>Add Coupon</Button>
      </div>
      {isLoading ? <TableSkeleton /> : (
        <div className="rounded-xl border p-8 text-center text-muted-foreground">
          Coupon management interface. Create, edit, and track promotional codes.
        </div>
      )}
    </div>
  );
}
