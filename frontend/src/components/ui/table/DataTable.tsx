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
import FilterForm from "../../filter/FilterForm";

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
  paginated?: boolean;
  filterBy?: keyof T | string;
  defaultItemsPerPage?: number;
}

export default function DataTable<T extends object>({
  columns,
  data,
  itemsPerPageOptions = [5, 10, 20],
  searchable = true,
  filterable = false,
  paginated = true,
  filterBy,
  defaultItemsPerPage,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    defaultItemsPerPage ?? itemsPerPageOptions[0]
  );

  // 🔥 state untuk filter form
  const [showFilterForm, setShowFilterForm] = useState(false);
  const [filters, setFilters] = useState<{
    dropdown: string;
    min?: number;
    max?: number;
  }>({
    dropdown: "all",
  });

  const inferredFilterKey = useMemo(() => {
    if (!filterable) return undefined;
    if (filterBy) return filterBy;
    const candidate = columns.find((col) =>
      data.some((row) => {
        const v = (row as any)[col.accessor];
        return typeof v === "string" || typeof v === "boolean";
      })
    );
    return candidate?.accessor;
  }, [filterable, filterBy, columns, data]);

  const filterOptions = useMemo(() => {
    if (!inferredFilterKey) return [];
    const s = new Set<string>();
    data.forEach((row) => {
      const v = (row as any)[inferredFilterKey];
      if (v !== undefined && v !== null) s.add(String(v));
    });
    return Array.from(s).sort();
  }, [inferredFilterKey, data]);

  // Filtering & Search logic
  const filteredData = useMemo(() => {
    let rows = data.slice();

    if (
      filterable &&
      inferredFilterKey &&
      filters.dropdown &&
      filters.dropdown !== "all"
    ) {
      rows = rows.filter(
        (r) =>
          String((r as any)[inferredFilterKey] ?? "").toLowerCase() ===
          filters.dropdown.toLowerCase()
      );
    }

    if (filters.min !== undefined) {
      rows = rows.filter((r) => (r as any).bobot >= filters.min!);
    }
    if (filters.max !== undefined) {
      rows = rows.filter((r) => (r as any).bobot <= filters.max!);
    }

    if (searchable && search.trim() !== "") {
      const q = search.toLowerCase();
      rows = rows.filter((row) =>
        columns.some((col) => {
          const v = (row as any)[col.accessor];
          return String(v ?? "")
            .toLowerCase()
            .includes(q);
        })
      );
    }

    return rows;
  }, [
    data,
    search,
    columns,
    filterable,
    inferredFilterKey,
    filters,
    searchable,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filters, itemsPerPage]);

  const totalPages = paginated
    ? Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
    : 1;

  const pageStart = paginated ? (currentPage - 1) * itemsPerPage : 0;
  const pageEnd = paginated ? currentPage * itemsPerPage : filteredData.length;
  const currentItems = filteredData.slice(pageStart, pageEnd);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      {/* Kontrol: search / filter */}
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
          <button
            onClick={() => setShowFilterForm(true)}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:text-white"
          >
            🔍 Filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              {columns.map((col, idx) => (
                <TableCell
                  key={idx}
                  isHeader
                  className={`px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400 ${
                    col.className || ""
                  }`}
                >
                  {col.header}
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
                          col.className || ""
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

      {/* Pagination + per-page dropdown */}
      {paginated && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
          itemsPerPage={itemsPerPage}
          itemsPerPageOptions={itemsPerPageOptions}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Popup FilterForm */}
      {showFilterForm && filterable && inferredFilterKey && (
        <FilterForm
          options={filterOptions}
          onApply={(f) => setFilters(f)}
          onClose={() => setShowFilterForm(false)}
        />
      )}
    </div>
  );
}
