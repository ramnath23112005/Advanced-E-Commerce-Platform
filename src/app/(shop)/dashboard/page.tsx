"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { User, Package, Heart, MapPin, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { signOut } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">My Account</h1>
        <p className="text-muted-foreground mb-6">Sign in to view your dashboard</p>
        <Link href="/login"><Button>Sign In</Button></Link>
      </div>
    );
  }

  const links = [
    { href: "/account/orders", label: "Order History", icon: Package, description: "View and track your orders" },
    { href: "/wishlist", label: "Wishlist", icon: Heart, description: "Items you've saved" },
    { href: "/account/addresses", label: "Addresses", icon: MapPin, description: "Manage shipping addresses" },
    { href: "/account/profile", label: "Profile", icon: User, description: "Update your personal info" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display">Welcome, {session.user.name?.split(" ")[0] || "Customer"}</h1>
          <p className="text-muted-foreground">{session.user.email}</p>
        </div>
        <Button variant="ghost" onClick={() => signOut()}><LogOut className="h-4 w-4 mr-1" /> Sign Out</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <Card hover className="h-full">
                <CardContent className="p-6 flex items-start gap-4">
                  <Icon className="h-8 w-8 text-primary mt-1" />
                  <div>
                    <h3 className="font-semibold">{link.label}</h3>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
