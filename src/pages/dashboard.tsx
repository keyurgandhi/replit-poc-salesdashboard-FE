import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSummary, useByRegion, useByMonth, useByCategory,
  useTopProducts, useTransactions, useFilters,
} from "@/hooks/use-sales-queries";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { RevenueByMonthChart, RevenueByRegionChart, RevenueByCategoryChart } from "@/components/dashboard/revenue-charts";
import { TopProductsTable, TransactionsTable } from "@/components/dashboard/data-tables";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RefreshCw, Moon, Sun, Printer } from "lucide-react";

function useDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);
  return { dark, toggle: () => setDark((d) => !d) };
}

export default function Dashboard() {
  const qc = useQueryClient();
  const { dark, toggle: toggleDark } = useDarkMode();

  const [year, setYear] = useState<number | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const f = { year, region, category };

  const filtersQ = useFilters();
  const summaryQ = useSummary(f);
  const byMonthQ = useByMonth(f);
  const byRegionQ = useByRegion({ year });
  const byCategoryQ = useByCategory(f);
  const topProductsQ = useTopProducts({ ...f, limit: 10 });
  const transactionsQ = useTransactions({ ...f, page, pageSize: PAGE_SIZE });

  const isLoading = summaryQ.isLoading || byMonthQ.isLoading || byCategoryQ.isLoading;

  const handleRefresh = () => qc.invalidateQueries();
  const handleClear = () => { setYear(null); setRegion(null); setCategory(null); setPage(1); };

  const isDark = dark;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1400px] mx-auto px-6 py-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
            <p className="text-muted-foreground mt-1 text-sm">Track revenue performance by region, category, and time</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Data Source:</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb", color: isDark ? "#ccc" : "#374151" }}>
                PostgreSQL
              </span>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold px-2 py-0.5 rounded transition-opacity hover:opacity-80"
                style={{ background: "#0079F2", color: "#fff" }}
              >
                API Docs ↗
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading} className="h-8 gap-1.5 text-xs">
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.print()} title="Print">
              <Printer className="w-3.5 h-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={toggleDark} title="Toggle dark mode">
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-6 print:hidden">
          <div className="space-y-1">
            <Label className="text-xs">Year</Label>
            <Select value={year?.toString() ?? "all"} onValueChange={(v) => { setYear(v === "all" ? null : Number(v)); setPage(1); }}>
              <SelectTrigger className="w-36 h-8 text-sm"><SelectValue placeholder="All Years" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {filtersQ.data?.years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Region</Label>
            <Select value={region ?? "all"} onValueChange={(v) => { setRegion(v === "all" ? null : v); setPage(1); }}>
              <SelectTrigger className="w-40 h-8 text-sm"><SelectValue placeholder="All Regions" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {filtersQ.data?.regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={category ?? "all"} onValueChange={(v) => { setCategory(v === "all" ? null : v); setPage(1); }}>
              <SelectTrigger className="w-44 h-8 text-sm"><SelectValue placeholder="All Categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {filtersQ.data?.categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {(year || region || category) && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={handleClear}>Clear filters</Button>
          )}
        </div>

        {/* KPI Cards */}
        <KPICards data={summaryQ.data} loading={summaryQ.isLoading} />

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2">
            <RevenueByMonthChart data={byMonthQ.data ?? []} loading={byMonthQ.isLoading} />
          </div>
          <RevenueByCategoryChart data={byCategoryQ.data ?? []} loading={byCategoryQ.isLoading} />
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <RevenueByRegionChart data={byRegionQ.data ?? []} loading={byRegionQ.isLoading} />
          <TopProductsTable data={topProductsQ.data ?? []} loading={topProductsQ.isLoading} />
        </div>

        {/* Transactions */}
        <TransactionsTable
          data={transactionsQ.data}
          loading={transactionsQ.isLoading || transactionsQ.isFetching}
          page={page}
          pageSize={PAGE_SIZE}
          setPage={setPage}
        />

      </div>
    </div>
  );
}
