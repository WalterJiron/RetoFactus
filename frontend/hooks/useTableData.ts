// En app/hooks/useTableData.ts
import { useState, useMemo } from "react";

interface UseTableDataProps<T> {
  initialData: T[];
  initialPage?: number;
  initialRowsPerPage?: number;
  initialSortConfig?: {
    key: keyof T | string | null;
    direction: "asc" | "desc";
  };
}

export function useTableData<T extends Record<string, any>>({
  initialData,
  initialPage = 1,
  initialRowsPerPage = 10,
  initialSortConfig = { key: null, direction: "asc" },
}: UseTableDataProps<T>) {
  const [data, setData] = useState<T[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [sortConfig, setSortConfig] = useState(initialSortConfig);

  // Filtrado por búsqueda
  const filteredData = useMemo(() => {
    return data.filter((item) =>
      Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [data, searchTerm]);

  // Ordenamiento
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof T];
      const bValue = b[sortConfig.key as keyof T];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;

      return 0;
    });
  }, [filteredData, sortConfig]);

  // Paginación
  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return sortedData.slice(start, end);
  }, [sortedData, page, rowsPerPage]);

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  const handleSort = (key: keyof T | string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  return {
    // Estado
    data,
    setData,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortConfig,
    setSortConfig,

    // Datos procesados
    filteredData,
    sortedData,
    paginatedData,
    totalPages,

    // Acciones
    handleSort,
  };
}
