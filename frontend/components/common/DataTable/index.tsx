// app/components/common/DataTable/index.tsx
"use client";

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Pagination,
  Select,
} from "@heroui/react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  sortConfig?: {
    key: keyof T | null;
    direction: "asc" | "desc";
  };
  onSort?: (key: keyof T) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  title?: string;
  emptyMessage?: string;
  showRowCount?: boolean;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortConfig,
  onSort,
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  title,
  emptyMessage = "No hay datos disponibles",
  showRowCount = true,
  className = "",
}: DataTableProps<T>) {
  return (
    <Card
      className={`border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
    >
      {title && (
        <CardHeader className="pb-2">
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        </CardHeader>
      )}
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <Table
            aria-label="Data table"
            classNames={{
              wrapper: "min-h-[400px]",
            }}
          >
            <TableHeader>
              {columns.map((column) => (
                <TableColumn
                  key={String(column.key)}
                  className={`text-sm font-semibold text-gray-700 dark:text-gray-300 ${column.className || ""}`}
                  onClick={() => column.sortable && onSort?.(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.label}
                    {column.sortable && (
                      <div className="flex flex-col ml-1">
                        {sortConfig?.key === column.key &&
                        sortConfig?.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronUp className="h-3 w-3 text-gray-300" />
                        )}
                        {sortConfig?.key === column.key &&
                        sortConfig?.direction === "desc" ? (
                          <ChevronDown className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-gray-300" />
                        )}
                      </div>
                    )}
                  </div>
                </TableColumn>
              ))}
            </TableHeader>
            <TableBody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {columns.map((column) => (
                      <TableCell key={String(column.key)}>
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="text-center py-12"
                  >
                    <div className="text-gray-500 dark:text-gray-400">
                      {emptyMessage}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-800">
            {showRowCount && (
              <span className="text-sm text-gray-500">
                Mostrando {data.length} de {data.length} registros
              </span>
            )}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Filas por página:</span>
              </div>
              <Pagination
                page={page}
                total={totalPages}
                onChange={onPageChange}
                size="sm"
                showControls
                showShadow
              />
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
