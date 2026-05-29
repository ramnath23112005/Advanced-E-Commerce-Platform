"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSettingsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Store Information</h3>
            <Input label="Store Name" defaultValue="LUXE" />
            <Input label="Support Email" defaultValue="support@luxe.com" />
            <Input label="Currency" defaultValue="USD" />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Shipping Configuration</h3>
            <Input label="Free Shipping Threshold" defaultValue="100" type="number" />
            <Input label="Standard Shipping Cost" defaultValue="9.99" type="number" />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">SEO Defaults</h3>
            <Input label="Default Meta Title" defaultValue="LUXE | Premium E-Commerce" />
            <Input label="Default Meta Description" defaultValue="Discover premium products curated for the discerning customer." />
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
