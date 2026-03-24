// app/(protected)/users/page.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { UserLock } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useRoles } from "../roles/_hooks/useRoles";

import { useUsers } from "./_hooks/useUsers";
import { User, UserDTO } from "./_types/users.types";
import { useUserColumns } from "./_components/UserColumns";
import UserFormModal from "./_components/UserFormModal";

export default function UserPage() {
  const formModal = useDisclosure();
  const {
    users,
    isLoading: usersLoading,
    error: usersError,
    addUser,
    editUser,
    toggleUserStatus,
  } = useUsers();
  const { roles, isLoading: rolesLoading } = useRoles();

  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState("all");

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
  } = useTableData<User>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  useEffect(() => {
    setData(users);
  }, [users, setData]);

  const filteredData = useMemo(() => {
    return baseFilteredData.filter((u) => {
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && u.active) ||
        (selectedStatus === "inactive" && !u.active);

      return matchStatus;
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPagesCount = Math.ceil(filteredData.length / rowsPerPage);

  const columns = useUserColumns({
    onEdit: (user) => {
      setSelectedUser(user);
      formModal.onOpen();
    },
    onToggle: (user) => toggleUserStatus(user.id, user.active),
  });

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

  const handleFormSubmit = async (data: UserDTO) => {
    try {
      if (selectedUser) {
        return await editUser(selectedUser.id, data);
      } else {
        return await addUser(data);
      }
    } catch (err) {
      // Error handled by hook
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<User>
        columns={columns}
        createLabel="Nuevo Usuario"
        data={paginatedData}
        description="Gestiona los usuarios y sus permisos de acceso"
        emptyMessage={
          usersLoading
            ? "Cargando usuarios..."
            : usersError
              ? `Error: ${usersError}`
              : "No hay usuarios registrados"
        }
        filters={filters}
        icon={UserLock}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar usuarios..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Usuarios"
        title="Gestión de Usuarios"
        totalPages={totalPagesCount}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSelectedUser(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={handleSort}
      />

      <UserFormModal
        error={usersError}
        isLoading={usersLoading}
        isOpen={formModal.isOpen}
        roles={roles}
        rolesLoading={rolesLoading}
        selectedUser={selectedUser}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedUser(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />
    </>
  );
}
