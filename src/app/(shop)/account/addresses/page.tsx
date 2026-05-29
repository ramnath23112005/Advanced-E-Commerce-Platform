"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import toast from "react-hot-toast";

export default function AddressesPage() {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<{ id: string; label: string; line1: string; line2?: string; city: string; state: string; postalCode: string; isDefault: boolean }[]>([]);

  useEffect(() => {
    if (session) fetch("/api/addresses").then(r => r.json()).then(d => setAddresses(d.addresses || []));
  }, [session]);

  if (!session) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Sign in to manage addresses</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold font-display">Addresses</h1>
        <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Address</Button>
      </div>
      {addresses.length === 0 ? (
        <div className="text-center py-20">
          <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No saved addresses</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="font-medium">{addr.label} {addr.isDefault && <span className="text-xs text-primary ml-1">Default</span>}</p>
                  <p className="text-sm text-muted-foreground">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                  <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.postalCode}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
