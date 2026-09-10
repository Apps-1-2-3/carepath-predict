import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { EmptyState } from "@/components/shared/States";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  sortValue?: (row: T) => number | string;
  cell: (row: T) => ReactNode;
  className?: string;
  tooltip?: ReactNode;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  searchable?: (row: T) => string;
  searchPlaceholder?: string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  toolbar?: ReactNode;
}

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  searchable,
  searchPlaceholder = "Search…",
  initialSort,
  pageSize = 10,
  onRowClick,
  emptyTitle,
  emptyDescription,
  toolbar,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(initialSort ?? null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return rows;
    return rows.filter((r) => searchable(r).toLowerCase().includes(q));
  }, [rows, query, searchable]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return filtered;
    const get = col.sortValue;
    return [...filtered].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages - 1);
  const visible = sorted.slice(current * pageSize, current * pageSize + pageSize);

  function toggleSort(key: string) {
    setPage(0);
    setSort((prev) =>
      prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );
  }

  return (
    <div className="space-y-3">
      {(searchable || toolbar) && (
        <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          {searchable ? (
            <div className="relative min-w-0 sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(0);
                }}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                className="pl-9"
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/60 hover:bg-secondary/60">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.className,
                  )}
                >
                  {col.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        col.align === "right" && "flex-row-reverse",
                      )}
                      aria-label={`Sort by ${col.header}`}
                    >
                      {col.header}
                      {sort?.key === col.key ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="size-3" aria-hidden="true" />
                        ) : (
                          <ArrowDown className="size-3" aria-hidden="true" />
                        )
                      ) : (
                        <ArrowUpDown className="size-3 opacity-40" aria-hidden="true" />
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1">{col.header}{col.tooltip}</span>
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle ?? "No matching patients"}
                    description={emptyDescription ?? "Try clearing the search box or widening your filters."}
                  />
                </TableCell>
              </TableRow>
            ) : (
              visible.map((row) => (
                <TableRow
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer")}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn("whitespace-nowrap text-sm", col.align === "right" && "text-right", col.className)}
                    >
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <p className="truncate text-xs text-muted-foreground">
          {sorted.length.toLocaleString()} row{sorted.length === 1 ? "" : "s"}
          {sorted.length ? ` · page ${current + 1} of ${totalPages}` : ""}
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage(current - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages - 1}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
