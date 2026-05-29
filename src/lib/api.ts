
import axios from 'axios';
// const BASE = "/api";

const BASE = axios.create({
  // Use the env variable in production, fallback to relative path for local dev proxy
  baseURL: import.meta.env.VITE_BACKEND_URL || '' 
});

console.log("base URL --- ",BASE.defaults.baseURL);

// async function get<T>(path: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
//   const url = new URL(BASE + path, window.location.origin);
//   if (params) {
//     for (const [k, v] of Object.entries(params)) {
//       if (v != null && v !== "") url.searchParams.set(k, String(v));
//     }
//   }
//   const res = await fetch(url.toString());
//   if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
//   return res.json() as Promise<T>;
// }

// REWRITTEN GET FUNCTION USING AXIOS
async function get<T>(path: string, params?: Record<string, string | number | null | undefined>): Promise<T> {
  // Clean up empty strings or null/undefined from params before sending
  const cleanParams: Record<string, string | number> = {};
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== "") {
        cleanParams[k] = v;
      }
    }
  }

  // Axios automatically merges baseURL + path and appends cleanParams as query parameters
  const response = await BASE.get<T>(path, {
    params: cleanParams
  });

  // Axios automatically throws an error on 4xx/5xx statuses, and parses JSON inside .data
  return response.data;
}

export interface SalesSummary {
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  revenueGrowth: number;
  topRegion: string;
  topCategory: string;
}

export interface RegionRevenue {
  region: string;
  revenue: number;
  orders: number;
}

export interface MonthRevenue {
  month: number;
  year: number;
  monthLabel: string;
  revenue: number;
  orders: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
  percentage: number | null;
}

export interface ProductRevenue {
  product: string;
  category: string;
  revenue: number;
  units: number;
}

export interface Transaction {
  id: number;
  date: string;
  region: string;
  category: string;
  product: string;
  revenue: number;
  units: number;
}

export interface TransactionPage {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SalesFilters {
  regions: string[];
  categories: string[];
  years: number[];
}

export type Filters = { year?: number | null; region?: string | null; category?: string | null };

export const api = {
  summary: (f: Filters) =>
    get<SalesSummary>("/sales/summary", { year: f.year, region: f.region }),

  byRegion: (f: Pick<Filters, "year">) =>
    get<RegionRevenue[]>("/sales/by-region", { year: f.year }),

  byMonth: (f: Filters) =>
    get<MonthRevenue[]>("/sales/by-month", { year: f.year, region: f.region, category: f.category }),

  byCategory: (f: Filters) =>
    get<CategoryRevenue[]>("/sales/by-category", { year: f.year, region: f.region }),

  topProducts: (f: Filters & { limit?: number }) =>
    get<ProductRevenue[]>("/sales/top-products", { year: f.year, region: f.region, limit: f.limit }),

  transactions: (f: Filters & { page: number; pageSize: number }) =>
    get<TransactionPage>("/sales/transactions", {
      year: f.year,
      region: f.region,
      category: f.category,
      page: f.page,
      pageSize: f.pageSize,
    }),

  filters: () => get<SalesFilters>("/sales/filters"),
};
