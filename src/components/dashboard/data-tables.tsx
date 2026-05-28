import { useMemo, useState } from "react";
import {
  useReactTable, getCoreRowModel, getSortedRowModel, flexRender,
  type ColumnDef, type SortingState,
} from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { ProductRevenue, Transaction, TransactionPage } from "@/lib/api";

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  if (!sorted) return <span className="w-3 inline-block" />;
  return sorted === "asc"
    ? <ChevronUp className="w-3 h-3 inline ml-0.5" />
    : <ChevronDown className="w-3 h-3 inline ml-0.5" />;
}

export function TopProductsTable({ data, loading }: { data: ProductRevenue[]; loading: boolean }) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "revenue", desc: true }]);

  const columns = useMemo<ColumnDef<ProductRevenue>[]>(() => [
    {
      accessorKey: "product",
      header: "Product",
      cell: ({ row }) => <span className="font-medium text-sm">{row.original.product}</span>,
    },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.category}</span> },
    { accessorKey: "units", header: "Units" },
    {
      accessorKey: "revenue",
      header: () => <div className="text-right">Revenue</div>,
      cell: ({ row }) => <div className="text-right font-medium tabular-nums">{fmtCurrency(row.original.revenue)}</div>,
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="px-5 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto px-4 pb-4">
        {loading ? (
          <div className="space-y-2">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}</div>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((h) => (
                      <TableHead
                        key={h.id}
                        className={`text-xs ${h.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        <SortIcon sorted={h.column.getIsSorted()} />
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TransactionsTable({
  data, loading, page, pageSize, setPage,
}: {
  data?: TransactionPage; loading: boolean;
  page: number; pageSize: number; setPage: (p: number) => void;
}) {
  const columns = useMemo<ColumnDef<Transaction>[]>(() => [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">#{row.original.id}</span>,
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">
          {new Date(row.original.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    { accessorKey: "region", header: "Region", cell: ({ row }) => <span className="text-sm">{row.original.region}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.category}</span> },
    { accessorKey: "product", header: "Product", cell: ({ row }) => <span className="text-sm">{row.original.product}</span> },
    { accessorKey: "units", header: "Units", cell: ({ row }) => <span className="tabular-nums">{row.original.units}</span> },
    {
      accessorKey: "revenue",
      header: () => <div className="text-right">Revenue</div>,
      cell: ({ row }) => <div className="text-right font-medium tabular-nums">{fmtCurrency(row.original.revenue)}</div>,
    },
  ], []);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: data ? Math.ceil(data.total / pageSize) : -1,
  });

  const totalPages = data ? Math.ceil(data.total / pageSize) : 1;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, data?.total ?? 0);

  return (
    <Card>
      <CardHeader className="px-5 pt-5 pb-2 flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
        {data && <span className="text-xs text-muted-foreground">{data.total.toLocaleString()} total records</span>}
      </CardHeader>
      <CardContent className="px-4 pb-5">
        {loading ? (
          <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((hg) => (
                    <TableRow key={hg.id}>
                      {hg.headers.map((h) => (
                        <TableHead key={h.id} className="text-xs">
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="py-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-20 text-center text-muted-foreground text-sm">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {data?.total ? `Showing ${from}–${to} of ${data.total.toLocaleString()}` : ""}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground px-1">{page} / {totalPages}</span>
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setPage(page + 1)} disabled={page >= totalPages}>
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
