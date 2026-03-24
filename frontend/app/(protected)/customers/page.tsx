// app/(protected)/customers/page.tsx
"use client";

import React, { useEffect, useMemo } from "react";
import { Users } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useCustomers } from "./_hooks/useCustomers";
import { Customer, CustomerDTO } from "./_types/customers.types";
import { getCustomerColumns } from "./_components/CustomerColumns";
import { CustomerFormModal } from "./_components/CustomerFormModal";
import { CustomerViewModal } from "./_components/CustomerViewModal";

export default function CustomersPage() {
  const formModal = useDisclosure();
  const viewModal = useDisclosure();

  const {
    customers,
    isLoading,
    error,
    addCustomer,
    editCustomer,
    toggleCustomerStatus,
  } = useCustomers();

  const [selectedCustomer, setSelectedCustomer] =
    React.useState<Customer | null>(null);
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
  } = useTableData<Customer>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(customers);
  }, [customers, setData]);

  const filteredData = useMemo(() => {
    return baseFilteredData.filter((c) => {
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && c.active) ||
        (selectedStatus === "inactive" && !c.active);

      return matchStatus;
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPagesCount = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getCustomerColumns({
    onEdit: (customer) => {
      setSelectedCustomer(customer);
      formModal.onOpen();
    },
    onToggle: (customer) =>
      toggleCustomerStatus(customer.idcustomer, customer.active),
    onView: (customer) => {
      setSelectedCustomer(customer);
      viewModal.onOpen();
    },
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

  const handleFormSubmit = async (data: CustomerDTO) => {
    try {
      if (selectedCustomer) {
        return await editCustomer(selectedCustomer.idcustomer, data);
      } else {
        return await addCustomer(data);
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Customer>
        columns={columns}
        createLabel="Nuevo Cliente"
        data={paginatedData}
        description="Gestión integral de la cartera de clientes y créditos"
        emptyMessage={
          isLoading
            ? "Cargando clientes..."
            : error
              ? `Error: ${error}`
              : "No se encontraron clientes"
        }
        filters={filters}
        icon={Users}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por nombre o identificación..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Cartera de Clientes"
        title="Clientes"
        totalPages={totalPagesCount}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSelectedCustomer(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={handleSort}
      />

      <CustomerFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedCustomer={selectedCustomer}
        successData={null} // Controlled by internal logic or passed down if needed
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedCustomer(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />

      <CustomerViewModal
        customer={selectedCustomer}
        isOpen={viewModal.isOpen}
        onOpenChange={viewModal.onOpenChange}
      />
    </>
  );
}
