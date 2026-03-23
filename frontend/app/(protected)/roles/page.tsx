"use client";

import React, { useEffect } from "react";
import { Shield } from "lucide-react";
import { useDisclosure } from "@heroui/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";
import { useTableData } from "@/hooks/useTableData";
import { useRoles } from "./_hooks/useRoles";
import { Role } from "./_types/roles.types";

export default function RolePage() {
  const formModal = useDisclosure();
  const { roles, isLoading, error, addRole, editRole, removeRole, toggleRoleStatus } = useRoles();
  
  const [selectedRole, setSelectedRole] = React.useState<Role | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState("all");

  const [formErrors, setFormErrors] = React.useState({ name: "", description: "" });
  const [formValues, setFormValues] = React.useState({ name: "", description: "" });
  const [touched, setTouched] = React.useState({ name: false, description: false });

  // Sync modal values when selectedRole changes
  useEffect(() => {
    if (formModal.isOpen) {
      setFormValues({
        name: selectedRole?.name_rol ?? "",
        description: selectedRole?.description ?? "",
      });
      setFormErrors({ name: "", description: "" });
      setTouched({ name: false, description: false });
    }
  }, [selectedRole, formModal.isOpen]);

  const validateName = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "El nombre del rol es obligatorio";
    if (trimmed.length < 2 || trimmed.length > 50) return "El nombre del rol debe tener entre 2 y 50 caracteres";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(trimmed)) return "El nombre del rol solo puede contener letras y espacios";
    return "";
  };

  const validateDescription = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return "La descripción es obligatoria";
    if (trimmed.length < 5) return "La descripción debe tener al menos 5 caracteres";
    return "";
  };

  const handleBlur = (field: "name" | "description") => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = field === "name" ? validateName(formValues.name) : validateDescription(formValues.description);
    setFormErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleValueChange = (field: "name" | "description", value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = field === "name" ? validateName(value) : validateDescription(value);
      setFormErrors(prev => ({ ...prev, [field]: error }));
    }
  };

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
    paginatedData,
    totalPages,
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

  // ── Columns ──────────────────────────────────────────────────────────────
  const columns = [
    {
      key: "id" as keyof Role,
      label: "ID",
      render: (value: number) => (
        <span className="font-mono font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "name_rol" as keyof Role,
      label: "Rol",
      render: (value: string) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "description" as keyof Role,
      label: "Descripción",
      render: (value: string) => (
        <span className="text-sm text-gray-500">{value}</span>
      ),
    },
    {
      key: "active" as keyof Role,
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value} />,
    },
    {
      key: "actions" as any,
      label: "Acciones",
      sortable: false,
      className: "text-right",
      render: (_: any, role: Role) => (
        <ActionButtons
          onEdit={() => {
            setSelectedRole(role);
            formModal.onOpen();
          }}
          onToggle={() => toggleRoleStatus(role.id, role.active)}
          isActive={role.active}
        />
      ),
    },
  ];

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const nameError = validateName(formValues.name);
    const descError = validateDescription(formValues.description);

    if (nameError || descError) {
      setFormErrors({ name: nameError, description: descError });
      setTouched({ name: true, description: true });
      return;
    }

    const data = {
      name: formValues.name.trim(),
      description: formValues.description.trim(),
    };

    try {
      if (selectedRole) {
        await editRole(selectedRole.id, data);
      } else {
        await addRole(data);
      }
      formModal.onClose();
      setSelectedRole(null);
    } catch (err) {
      // Error is handled in hook
    }
  };

  return (
    <>
      <PageTemplate<Role>
        columns={columns}
        createLabel="Nuevo Rol"
        data={statusFilteredPaginatedData}
        description="Administra los roles y permisos del sistema"
        emptyMessage={isLoading ? "Cargando roles..." : (error ? `Error: ${error}` : "No hay roles que coincidan con los filtros")}
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
          setSelectedRole(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <Modal
        isOpen={formModal.isOpen}
        size="2xl"
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRole(null);
          }
          formModal.onOpenChange();
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedRole ? "Editar Rol" : "Nuevo Rol"}
                </h2>
              </ModalHeader>
              <ModalBody className="gap-4">
                <Input
                  name="name"
                  value={formValues.name}
                  onValueChange={(val) => handleValueChange("name", val)}
                  onBlur={() => handleBlur("name")}
                  isInvalid={touched.name && !!formErrors.name}
                  errorMessage={touched.name && formErrors.name}
                  label="Nombre del rol"
                  placeholder="Ej. Administrador"
                  variant="bordered"
                  isRequired
                />
                <Textarea
                  name="description"
                  value={formValues.description}
                  onValueChange={(val) => handleValueChange("description", val)}
                  onBlur={() => handleBlur("description")}
                  isInvalid={touched.description && !!formErrors.description}
                  errorMessage={touched.description && formErrors.description}
                  label="Descripción"
                  placeholder="Describe los permisos de este rol..."
                  variant="bordered"
                  isRequired
                />
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={() => {
                    onClose();
                    setSelectedRole(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={touched.name && (!!formErrors.name || !!formErrors.description)}
                >
                  {selectedRole ? "Guardar Cambios" : "Crear Rol"}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
