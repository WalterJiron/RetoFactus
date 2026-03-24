"use client";

import React, { useEffect } from "react";
import { Shield } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useRoles } from "./_hooks/useRoles";
import { Role } from "./_types/roles.types";
import { getRoleColumns } from "./_components/RoleColumns";
import { RoleFormModal } from "./_components/RoleFormModal";

export default function RolePage() {
  const formModal = useDisclosure();
  const { roles, isLoading, error, addRole, editRole, toggleRoleStatus } =
    useRoles();

  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
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
  } = useTableData<Role>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(roles);
  }, [roles, setData]);

  const filteredData = React.useMemo(() => {
    return baseFilteredData.filter((r) => {
      return (
        selectedStatus === "all" ||
        (selectedStatus === "active" && r.active) ||
        (selectedStatus === "inactive" && !r.active)
      );
    });
  }, [baseFilteredData, selectedStatus]);

  // Recalculate pagination for the status filter
  const statusFilteredPaginatedData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const statusFilteredTotalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getRoleColumns((role) => {
    setSuccessData(null);
    setSelectedRole(role);
    formModal.onOpen();
  }, toggleRoleStatus);

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

      if (selectedRole) {
        response = await editRole(selectedRole.id, data);
      } else {
        response = await addRole(data);
      }
      setSuccessData(response);

      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Role>
        columns={columns}
        createLabel="Nuevo Rol"
        data={statusFilteredPaginatedData}
        description="Administra los roles y permisos del sistema"
        emptyMessage={
          isLoading
            ? "Cargando roles..."
            : error
              ? `Error: ${error}`
              : "No hay roles que coincidan con los filtros"
        }
        filters={filters}
        icon={Shield}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar roles..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Roles"
        title="Gestión de Roles"
        totalPages={statusFilteredTotalPages}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSuccessData(null);
          setSelectedRole(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <RoleFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedRole={selectedRole}
        successData={successData}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRole(null);
            setSuccessData(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
