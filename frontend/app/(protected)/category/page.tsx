"use client";

import React, { useEffect } from "react";
import { Layers } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useCategory } from "./_hooks/useCategory";
import { Category } from "./_types/category.types";
import { getCategoryColumns } from "./_components/CategoryColumns";
import { CategoryFormModal } from "./_components/CategoryFormModal";

export default function CategoryPage() {
  const formModal = useDisclosure();
  const {
    categories,
    isLoading,
    error,
    addCategory,
    editCategory,
    toggleCategoryStatus,
  } = useCategory();

  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [successData, setSuccessData] = React.useState<any>(null);

  const {
    setData,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    sortConfig,
    handleSort,
    filteredData: baseFilteredData,
  } = useTableData<Category>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(categories);
  }, [categories, setData]);

  const filteredData = React.useMemo(() => {
    return baseFilteredData.filter((c) => {
      return (
        selectedStatus === "all" ||
        (selectedStatus === "active" && c.active) ||
        (selectedStatus === "inactive" && !c.active)
      );
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getCategoryColumns((cat) => {
    setSuccessData(null);
    setSelectedCategory(cat);
    formModal.onOpen();
  }, toggleCategoryStatus);

  const filters = [
    {
      key: "status",
      label: "Estado",
      value: selectedStatus,
      options: [
        { label: "Todos los estados", value: "all" },
        { label: "Activos", value: "active" },
        { label: "Inactivos", value: "inactive" },
      ],
      onChange: setSelectedStatus,
    },
  ];

  const handleFormSubmit = async (data: any) => {
    try {
      let response;

      if (selectedCategory) {
        response = await editCategory(selectedCategory.id, data);
      } else {
        response = await addCategory(data);
      }
      setSuccessData(response);

      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Category>
        columns={columns}
        createLabel="Nueva Categoría"
        data={paginatedData}
        description="Gestiona las categorías de productos del sistema"
        emptyMessage={
          isLoading
            ? "Cargando categorías..."
            : error
              ? `Error: ${error}`
              : "No se encontraron categorías"
        }
        filters={filters}
        icon={Layers}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por nombre o descripción..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Categorías"
        title="Categorías"
        totalPages={totalPages}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSuccessData(null);
          setSelectedCategory(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <CategoryFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedCategory={selectedCategory}
        successData={successData}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCategory(null);
            setSuccessData(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
