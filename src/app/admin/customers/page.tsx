"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string | null; role: string; isActive: boolean; createdAt: string; _count: { orders: number } }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users").then(r => r.json()).then(d => setUsers(d.users || [])).finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <TableSkeleton />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium">Name</th>
              <th className="text-left p-4 font-medium">Email</th>
              <th className="text-left p-4 font-medium">Role</th>
              <th className="text-left p-4 font-medium">Orders</th>
              <th className="text-left p-4 font-medium">Joined</th>
              <th className="text-left p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t hover:bg-muted/30 transition-colors">
                <td className="p-4 font-medium">{user.name || "N/A"}</td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4"><Badge variant={user.role === "ADMIN" ? "info" : "default"}>{user.role}</Badge></td>
                <td className="p-4">{user._count.orders}</td>
                <td className="p-4 text-muted-foreground">{formatDate(user.createdAt)}</td>
                <td className="p-4"><Badge variant={user.isActive ? "success" : "danger"}>{user.isActive ? "Active" : "Inactive"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
