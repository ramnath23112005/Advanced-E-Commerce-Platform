import { Card, CardContent } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Revenue Overview</h3>
            <p className="text-sm text-muted-foreground">
              Revenue tracking, sales trends, and forecasting powered by Redis-cached daily aggregates.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Customer Insights</h3>
            <p className="text-sm text-muted-foreground">
              Customer acquisition, retention rates, and lifetime value analytics.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Product Performance</h3>
            <p className="text-sm text-muted-foreground">
              Top sellers, inventory turnover, and category performance metrics.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Traffic & Conversion</h3>
            <p className="text-sm text-muted-foreground">
              Page views, conversion rates, and funnel analysis for the sales pipeline.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
