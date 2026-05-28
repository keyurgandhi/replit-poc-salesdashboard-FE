import { useQuery } from "@tanstack/react-query";
import { api, type Filters } from "@/lib/api";

const STALE = 5 * 60 * 1000;

export function useSummary(f: Filters) {
  return useQuery({
    queryKey: ["summary", f.year, f.region],
    queryFn: () => api.summary(f),
    staleTime: STALE,
  });
}

export function useByRegion(f: Pick<Filters, "year">) {
  return useQuery({
    queryKey: ["by-region", f.year],
    queryFn: () => api.byRegion(f),
    staleTime: STALE,
  });
}

export function useByMonth(f: Filters) {
  return useQuery({
    queryKey: ["by-month", f.year, f.region, f.category],
    queryFn: () => api.byMonth(f),
    staleTime: STALE,
  });
}

export function useByCategory(f: Filters) {
  return useQuery({
    queryKey: ["by-category", f.year, f.region],
    queryFn: () => api.byCategory(f),
    staleTime: STALE,
  });
}

export function useTopProducts(f: Filters & { limit?: number }) {
  return useQuery({
    queryKey: ["top-products", f.year, f.region, f.limit],
    queryFn: () => api.topProducts(f),
    staleTime: STALE,
  });
}

export function useTransactions(f: Filters & { page: number; pageSize: number }) {
  return useQuery({
    queryKey: ["transactions", f.year, f.region, f.category, f.page, f.pageSize],
    queryFn: () => api.transactions(f),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useFilters() {
  return useQuery({
    queryKey: ["filters"],
    queryFn: () => api.filters(),
    staleTime: Infinity,
  });
}
