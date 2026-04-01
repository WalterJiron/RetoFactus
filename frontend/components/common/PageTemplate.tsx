// components/common/PageTemplate.tsx
"use client";

import React from "react";
import { Button } from "@heroui/react";
import { Plus, LucideIcon } from "lucide-react";

import { FilterBar } from "@/components/common/FilterBar";
import { DataTable } from "@/components/common/DataTable";

export type FilterDefinition = {
  key: string;
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

export type ColumnDefinition<T> = {
  key: keyof T | "actions";
  label: string;
  sortable?: boolean;
  className?: string;
  render?: (value: any, row: T) => React.ReactNode;
};

type PageTemplateProps<T> = {
  /** Page icon from lucide-react */
  icon: LucideIcon;
  /** Main heading */
  title: string;
  /** Subtitle / description */
  description: string;
  /** Label for the create button */
  createLabel?: string;
  /** Called when the "New" button is pressed */
  onCreateClick?: () => void;
  /** Column definitions for the DataTable */
  columns: ColumnDefinition<T>[];
  /** Currently visible rows (already paginated) */
  data: T[];
  /** Total number of pages */
  totalPages: number;
  /** Current page number */
  page: number;
  /** Rows per page */
  rowsPerPage: number;
  /** Current sort config */
  sortConfig: { key: string | null; direction: "asc" | "desc" } | null;
  /** Table title */
  tableTitle?: string;
  /** Empty state message */
  emptyMessage?: string;
  /** Filter definitions for the FilterBar */
  filters?: FilterDefinition[];
  /** Current search term */
  searchTerm?: string;
  /** Called when search changes */
  onSearchChange?: (value: string) => void;
  /** Called when filters are cleared */
  onClearFilters?: () => void;
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Callback when rows-per-page changes */
  onRowsPerPageChange: (rows: number) => void;
  /** Callback when sort changes */
  onSort: (key: string) => void;
  /** Optional extra content rendered after the table (e.g. modals) */
  children?: React.ReactNode;
  /** Whether the page is in a loading state */
  isLoading?: boolean;
};

/**
 * Generic page layout for CRUD list views (products, users, roles, etc.)
 *
 * Provides:
 *  - Consistent page header with icon, title, description and "new" button
 *  - FilterBar with search + custom filters
 *  - Paginated, sortable DataTable
 *  - A `children` slot to render modals below the table
 */
export function PageTemplate<T extends Record<string, any>>({
  icon: Icon,
  title,
  description,
  createLabel = "Nuevo",
  onCreateClick,
  columns,
  data,
  totalPages,
  page,
  rowsPerPage,
  sortConfig,
  tableTitle,
  emptyMessage = "No hay registros que coincidan con los filtros",
  filters = [],
  searchTerm = "",
  onSearchChange,
  onClearFilters,
  searchPlaceholder = "Buscar...",
  onPageChange,
  onRowsPerPageChange,
  onSort,
  children,
  isLoading = false,
}: PageTemplateProps<T>) {
  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Icon className="h-8 w-8 text-primary-600" />
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
        </div>

        {onCreateClick && (
          <div className="flex items-center gap-3">
            <Button
              color="primary"
              isDisabled={isLoading}
              isLoading={isLoading}
              startContent={<Plus className="h-4 w-4" />}
              onPress={onCreateClick}
            >
              {createLabel}
            </Button>
          </div>
        )}
      </header>

      {/* Filter bar */}
      {(filters.length > 0 || onSearchChange) && (
        <FilterBar
          filters={filters}
          placeholder={searchPlaceholder}
          searchTerm={searchTerm}
          onClearFilters={onClearFilters ?? (() => { })}
          onSearchChange={onSearchChange ?? (() => { })}
        />
      )}

      {/* Data table */}
      <DataTable
        columns={columns as any}
        data={data}
        emptyMessage={emptyMessage}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        sortConfig={sortConfig ?? undefined}
        title={tableTitle ?? title}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onSort={(key) => onSort(String(key))}
      />

      {/* Modals / extra content */}
      {children}
    </div>
  );
}
