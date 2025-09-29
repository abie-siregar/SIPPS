import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import InputField from "../field/InputFields";
import Pagination from "../button/Pagination";
import FilterForm, {
  DropdownFilter,
  RangeFilter,
} from "../../filter/FilterForm";
import Button from "../button/Button";

export interface Column<T> {
  header: string;
  accessor: keyof T | string;
  render?: (row: T, rowIndex?: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  itemsPerPageOptions?: number[];
  searchable?: boolean;
  filterable?: boolean;
  filterColumns?: (keyof T)[];
  paginated?: boolean;
  defaultItemsPerPage?: number;
}

export default function DataTable<T extends object>({
  columns,
  data,
  itemsPerPageOptions = [5, 10, 20],
  searchable = true,
  filterable = false,
  filterColumns,
  paginated = true,
  defaultItemsPerPage,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    defaultItemsPerPage ?? itemsPerPageOptions[0]
  );
  const [filters, setFilters] = useState<{ [key: string]: any }>({});
  const [showFilterForm, setShowFilterForm] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  // Dropdown filters
  const dropdownFilters: DropdownFilter[] = useMemo(() => {
    if (!filterable || !filterColumns) return [];
    return filterColumns
      .filter((key) =>
        data.some((row) => {
          const v = (row as any)[key];
          return typeof v === "string" || typeof v === "boolean";
        })
      )
      .map((key) => {
        const options = Array.from(
          new Set(
            data
              .map((row) => (row as any)[key])
              .filter((v) => v !== undefined && v !== null)
              .map(String)
          )
        ).sort();
        const col = columns.find((c) => c.accessor === key);
        return {
          key: String(key),
          label: col?.header || String(key),
          options: options.map((v) => ({ label: v, value: v })),
        };
      });
  }, [filterable, filterColumns, data, columns]);

  // Range filters
  const rangeFilters: RangeFilter[] = useMemo(() => {
    if (!filterable || !filterColumns) return [];
    return filterColumns
      .filter((key) =>
        data.some((row) => typeof (row as any)[key] === "number")
      )
      .map((key) => {
        const numbers = data
          .map((row) => Number((row as any)[key]))
          .filter((v) => !isNaN(v));
        const col = columns.find((c) => c.accessor === key);
        return {
          key: String(key),
          label: col?.header || String(key),
          min: Math.min(...numbers),
          max: Math.max(...numbers),
        };
      });
  }, [filterable, filterColumns, data, columns]);

  // Filtered data
  const filteredData = useMemo(() => {
    let rows = [...data];

    dropdownFilters.forEach((df) => {
      const value = filters[df.key];
      if (value && value !== "all") {
        rows = rows.filter(
          (r) =>
            String((r as any)[df.key]).toLowerCase() ===
            String(value).toLowerCase()
        );
      }
    });

    rangeFilters.forEach((rf) => {
      const range = filters[rf.key];
      if (range && Array.isArray(range) && range.length === 2) {
        rows = rows.filter(
          (r) =>
            (r as any)[rf.key] >= range[0] && (r as any)[rf.key] <= range[1]
        );
      }
    });

    if (searchable && search.trim() !== "") {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) =>
          String((row as any)[col.accessor] ?? "")
            .toLowerCase()
            .includes(q)
        )
      );
    }

    return rows;
  }, [
    data,
    filters,
    search,
    columns,
    dropdownFilters,
    rangeFilters,
    searchable,
  ]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;
    const { key, direction } = sortConfig;
    return [...filteredData].sort((a, b) => {
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];
      if (aVal === bVal) return 0;
      if (direction === "asc") return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });
  }, [filteredData, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, search, itemsPerPage, sortConfig]);

  const totalPages = paginated
    ? Math.max(1, Math.ceil(sortedData.length / itemsPerPage))
    : 1;
  const pageStart = paginated ? (currentPage - 1) * itemsPerPage : 0;
  const pageEnd = paginated ? currentPage * itemsPerPage : sortedData.length;
  const currentItems = sortedData.slice(pageStart, pageEnd);

  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Kontrol */}
      <div className="flex items-center justify-between gap-2 p-4 flex-wrap">
        {searchable && (
          <InputField
            type="text"
            placeholder="Cari data..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        )}
        {filterable && (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => setShowFilterForm(true)}
          >
            🔍 Filter
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full text-sm text-left">
          <TableHeader className="bg-gray-100 text-black rounded-t-lg border-b border-gray-200">
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 cursor-pointer ${
                    col.className ?? "text-left"
                  }`}
                  onClick={() => handleSort(String(col.accessor))}
                >
                  <div className={`flex items-center gap-1 ${
                        col.className?.includes("text-center")
                          ? "justify-center"
                          : "justify-start"
                      }`}>
                    {col.header}
                    {sortConfig?.key === col.accessor && (
                      <span>
                        {sortConfig.direction === "asc" ? "🔼" : "🔽"}
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {currentItems.length > 0 ? (
              currentItems.map((row, idxOnPage) => {
                const globalIndex = pageStart + idxOnPage;
                return (
                  <TableRow key={globalIndex}>
                    {columns.map((col, colIndex) => (
                      <TableCell
                        key={colIndex}
                        className={`px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 ${
                          col.className ?? "text-left"
                        }`}
                      >
                        {col.render
                          ? col.render(row, globalIndex)
                          : (row as any)[col.accessor]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="px-4 py-3 text-center text-gray-400"
                >
                  Tidak ada data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {paginated && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          itemsPerPageOptions={itemsPerPageOptions}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* FilterForm */}
      {showFilterForm &&
        filterable &&
        (dropdownFilters.length > 0 || rangeFilters.length > 0) && (
          <FilterForm
            dropdownFilters={dropdownFilters}
            rangeFilters={rangeFilters}
            onApply={(f) => setFilters(f)}
            onClose={() => setShowFilterForm(false)}
          />
        )}
    </div>
  );
}
