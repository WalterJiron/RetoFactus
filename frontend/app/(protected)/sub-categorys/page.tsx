"use client";

import React, { useEffect } from "react";
import { ListTree } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useSubCategory } from "./_hooks/useSubCategory";
import { SubCategory } from "./_types/sub-category.types";
import { getSubCategoryColumns } from "./_components/SubCategoryColumns";
import { SubCategoryFormModal } from "./_components/SubCategoryFormModal";

export default function SubCategoryPage() {
  const formModal = useDisclosure();
  const {
    subCategories,
    isLoading,
    error,
    addSubCategory,
    editSubCategory,
    toggleSubCategoryStatus,
  } = useSubCategory();

  const [selectedSubCategory, setSelectedSubCategory] =
    React.useState<SubCategory | null>(null);
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
  } = useTableData<SubCategory>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(subCategories);
  }, [subCategories, setData]);

  const filteredData = React.useMemo(() => {
    return baseFilteredData.filter((s) => {
      return (
        selectedStatus === "all" ||
        (selectedStatus === "active" && s.active) ||
        (selectedStatus === "inactive" && !s.active)
      );
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getSubCategoryColumns((sub) => {
    setSuccessData(null);
    setSelectedSubCategory(sub);
    formModal.onOpen();
  }, toggleSubCategoryStatus);

  const filters = [
    {
      key: "status",
      label: "Estado",
      value: selectedStatus,
      options: [
        { label: "Todos los estados", value: "all" },
        { label: "Activas", value: "active" },
        { label: "Inactivas", value: "inactive" },
      ],
      onChange: setSelectedStatus,
    },
  ];

  const handleFormSubmit = async (data: any) => {
    try {
      let response;

      if (selectedSubCategory) {
        response = await editSubCategory(selectedSubCategory.id, data);
      } else {
        response = await addSubCategory(data);
      }
      setSuccessData(response);

      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<SubCategory>
        columns={columns}
        createLabel="Nueva Sub-categoría"
        data={paginatedData}
        description="Gestiona las sub-categorías de productos"
        emptyMessage={
          isLoading
            ? "Cargando sub-categorías..."
            : error
              ? `Error: ${error}`
              : "No se encontraron sub-categorías"
        }
        filters={filters}
        icon={ListTree}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por nombre o categoría..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Sub-categorías"
        title="Sub-categorías"
        totalPages={totalPages}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSuccessData(null);
          setSelectedSubCategory(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <SubCategoryFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedSubCategory={selectedSubCategory}
        successData={successData}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSubCategory(null);
            setSuccessData(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
