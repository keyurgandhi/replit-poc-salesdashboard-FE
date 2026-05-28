import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import type { MonthRevenue, RegionRevenue, CategoryRevenue } from "@/lib/api";

const COLORS = ["#0079F2", "#795EFF", "#009118", "#A60808", "#ec4899", "#f59e0b"];

function fmtK(v: number) {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v}`;
}

function fmtFull(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-sm flex-shrink-0" style={{ background: e.color }} />
          <span className="text-muted-foreground">{e.name}:</span>
          <span className="font-semibold">{typeof e.value === "number" ? fmtFull(e.value) : e.value}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueByMonthChart({ data, loading }: { data: MonthRevenue[]; loading: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold">Revenue by Month</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? <Skeleton className="w-full h-[280px]" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: 10, right: 10, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0079F2" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0079F2" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone" dataKey="revenue" name="Revenue"
                stroke="#0079F2" strokeWidth={2}
                fill="url(#grad)" isAnimationActive={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueByRegionChart({ data, loading }: { data: RegionRevenue[]; loading: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold">Revenue by Region</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? <Skeleton className="w-full h-[280px]" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" horizontal={false} />
              <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="region" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={75} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(128,128,128,0.08)" }} />
              <Bar dataKey="revenue" name="Revenue" fill="#795EFF" radius={[0, 3, 3, 0]} isAnimationActive={false} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function RevenueByCategoryChart({ data, loading }: { data: CategoryRevenue[]; loading: boolean }) {
  return (
    <Card className="h-full">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold">Revenue by Category</CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-4">
        {loading ? <Skeleton className="w-full h-[280px]" /> : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data} dataKey="revenue" nameKey="category"
                cx="50%" cy="42%" outerRadius={95} innerRadius={52}
                paddingAngle={2} cornerRadius={2} isAnimationActive={false} stroke="none"
              >
                {data.map((_e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                formatter={(v: number) => fmtFull(v)}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend
                iconType="circle" iconSize={8}
                formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
