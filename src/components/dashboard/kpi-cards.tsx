import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, BarChart2, MapPin } from "lucide-react";
import type { SalesSummary } from "@/lib/api";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}
function compact(n: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

interface Props { data?: SalesSummary; loading: boolean }

export function KPICards({ data, loading }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      <KPICard
        title="Total Revenue"
        value={data ? fmt(data.totalRevenue) : "—"}
        sub={data ? `${compact(data.totalOrders)} orders` : undefined}
        icon={<DollarSign className="w-4 h-4" />}
        loading={loading}
        accent="#0079F2"
      />
      <KPICard
        title="Total Orders"
        value={data ? compact(data.totalOrders) : "—"}
        sub={data ? `Avg ${fmt(data.avgOrderValue)} / order` : undefined}
        icon={<ShoppingCart className="w-4 h-4" />}
        loading={loading}
        accent="#795EFF"
      />
      <KPICard
        title="Avg Order Value"
        value={data ? fmt(data.avgOrderValue) : "—"}
        sub={data ? `Top: ${data.topCategory}` : undefined}
        icon={<BarChart2 className="w-4 h-4" />}
        loading={loading}
        accent="#009118"
      />
      <KPICard
        title="MoM Growth"
        value={data ? `${Math.abs(data.revenueGrowth).toFixed(1)}%` : "—"}
        sub={data ? (data.revenueGrowth >= 0 ? "vs last month ↑" : "vs last month ↓") : undefined}
        icon={data && data.revenueGrowth >= 0
          ? <TrendingUp className="w-4 h-4" />
          : <TrendingDown className="w-4 h-4" />}
        loading={loading}
        accent={data && data.revenueGrowth >= 0 ? "#009118" : "#A60808"}
        extra={data ? `Top region: ${data.topRegion}` : undefined}
      />
    </div>
  );
}

function KPICard({
  title, value, sub, icon, loading, accent, extra,
}: {
  title: string; value: string; sub?: string; icon: React.ReactNode;
  loading: boolean; accent: string; extra?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{title}</p>
              <span style={{ color: accent }}>{icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
            {extra && <p className="text-xs text-muted-foreground mt-0.5">{extra}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
