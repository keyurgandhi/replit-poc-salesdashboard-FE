import { useMemo } from "react";
import {
  ALL_TRANSACTIONS,
  SALES_FILTERS,
  type SalesSummary,
  type MonthRevenue,
  type RegionRevenue,
  type CategoryRevenue,
  type ProductRevenue,
  type TransactionPage,
} from "../data/static-data";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function filterTxs(year: number | null, region: string | null, category: string | null) {
  return ALL_TRANSACTIONS.filter((tx) => {
    if (year !== null && parseInt(tx.date.slice(0, 4)) !== year) return false;
    if (region !== null && tx.region !== region) return false;
    if (category !== null && tx.category !== category) return false;
    return true;
  });
}

export function useSalesData(
  year: number | null,
  region: string | null,
  category: string | null,
  page: number,
  pageSize: number
) {
  const filtered = useMemo(() => filterTxs(year, region, category), [year, region, category]);

  const summary = useMemo<SalesSummary>(() => {
    const totalRevenue = filtered.reduce((s, t) => s + t.revenue, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    let revenueGrowth = 0;
    if (year !== null) {
      const prev = filterTxs(year - 1, region, category);
      const prevRevenue = prev.reduce((s, t) => s + t.revenue, 0);
      revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    }

    return { totalRevenue, totalOrders, avgOrderValue, revenueGrowth };
  }, [filtered, year, region, category]);

  const byMonth = useMemo<MonthRevenue[]>(() => {
    const map = new Map<string, number>();
    filtered.forEach((tx) => {
      const yr = parseInt(tx.date.slice(0, 4));
      const mo = parseInt(tx.date.slice(5, 7));
      const key = `${yr}-${mo}`;
      map.set(key, (map.get(key) ?? 0) + tx.revenue);
    });
    return Array.from(map.entries())
      .map(([key, revenue]) => {
        const [yr, mo] = key.split("-").map(Number);
        return { year: yr, month: mo, monthLabel: `${MONTH_LABELS[mo - 1]} ${yr}`, revenue: Math.round(revenue) };
      })
      .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  }, [filtered]);

  const byRegion = useMemo<RegionRevenue[]>(() => {
    const base = filterTxs(year, null, category);
    const map = new Map<string, { revenue: number; orders: number }>();
    SALES_FILTERS.regions.forEach((r) => map.set(r, { revenue: 0, orders: 0 }));
    base.forEach((tx) => {
      const e = map.get(tx.region)!;
      e.revenue += tx.revenue;
      e.orders += 1;
    });
    return SALES_FILTERS.regions.map((r) => ({
      region: r,
      revenue: Math.round(map.get(r)!.revenue),
      orders: map.get(r)!.orders,
    }));
  }, [year, category]);

  const byCategory = useMemo<CategoryRevenue[]>(() => {
    const map = new Map<string, { revenue: number; orders: number }>();
    filtered.forEach((tx) => {
      const e = map.get(tx.category) ?? { revenue: 0, orders: 0 };
      e.revenue += tx.revenue;
      e.orders += 1;
      map.set(tx.category, e);
    });
    return Array.from(map.entries())
      .map(([cat, s]) => ({ category: cat, revenue: Math.round(s.revenue), orders: s.orders }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filtered]);

  const topProducts = useMemo<ProductRevenue[]>(() => {
    const map = new Map<string, { category: string; revenue: number; units: number }>();
    filtered.forEach((tx) => {
      const e = map.get(tx.product) ?? { category: tx.category, revenue: 0, units: 0 };
      e.revenue += tx.revenue;
      e.units += tx.units;
      map.set(tx.product, e);
    });
    return Array.from(map.entries())
      .map(([product, s]) => ({ product, category: s.category, revenue: Math.round(s.revenue), units: s.units }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filtered]);

  const transactions = useMemo<TransactionPage>(() => {
    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
    const start = (page - 1) * pageSize;
    return { data: sorted.slice(start, start + pageSize), total: sorted.length, page, pageSize };
  }, [filtered, page, pageSize]);

  return { summary, byMonth, byRegion, byCategory, topProducts, transactions, filters: SALES_FILTERS };
}
