"use client";

import React, { useEffect } from "react";
import { Store } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useEstablishments } from "./_hooks/useEstablishments";
import { Establishment } from "./_types/establishments.types";
import { getEstablishmentColumns } from "./_components/EstablishmentColumns";
import { EstablishmentFormModal } from "./_components/EstablishmentFormModal";

export default function EstablishmentsPage() {
  const formModal = useDisclosure();
  const {
    establishments,
    isLoading,
    error,
    addEstablishment,
    editEstablishment,
    deleteEstablishment,
  } = useEstablishments();

  const [selectedEstablishment, setSelectedEstablishment] =
    React.useState<Establishment | null>(null);
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
  } = useTableData<Establishment>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(establishments);
  }, [establishments, setData]);

  const filteredData = React.useMemo(() => {
    return baseFilteredData.filter((e) => {
      return (
        selectedStatus === "all" ||
        (selectedStatus === "active" && e.active) ||
        (selectedStatus === "inactive" && !e.active)
      );
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getEstablishmentColumns((est) => {
    setSuccessData(null);
    setSelectedEstablishment(est);
    formModal.onOpen();
  }, deleteEstablishment);

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

      if (selectedEstablishment) {
        response = await editEstablishment(
          selectedEstablishment.idestablishment,
          data,
        );
      } else {
        response = await addEstablishment(data);
      }
      setSuccessData(response);

      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Establishment>
        columns={columns}
        createLabel="Nuevo Establecimiento"
        data={paginatedData}
        description="Gestiona los puntos de venta y sucursales"
        emptyMessage={
          isLoading
            ? "Cargando establecimientos..."
            : error
              ? `Error: ${error}`
              : "No se encontraron establecimientos"
        }
        filters={filters}
        icon={Store}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por nombre o dirección..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Establecimientos"
        title="Establecimientos"
        totalPages={totalPages}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSuccessData(null);
          setSelectedEstablishment(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <EstablishmentFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedEstablishment={selectedEstablishment}
        successData={successData}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedEstablishment(null);
            setSuccessData(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
