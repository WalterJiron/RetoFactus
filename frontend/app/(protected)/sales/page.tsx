"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useSales } from "./_hooks/useSales";
import { useCustomers } from "../customers/_hooks/useCustomers";
import { useProducts } from "../products/_hooks/useProducts";
import { usePaymentForms } from "../payment-forms/_hooks/usePaymentForms";

import { Sale, CreateSaleDTO, SaleDetailDTO } from "./_types/sales.types";
import { useSaleColumns } from "./_components/SaleColumns";
import SaleFormModal from "./_components/SaleFormModal";
import SaleViewModal from "./_components/SaleViewModal";

export default function SalesPage() {
  const formModal = useDisclosure();
  const viewModal = useDisclosure();

  const {
    sales,
    isLoading: salesLoading,
    error: salesError,
    clearError,
    addSale,
    editSale,
    changeSaleStatus,
    toggleSaleActiveStatus,
  } = useSales();

  const { customers, isLoading: customersLoading } = useCustomers();
  const { products, isLoading: productsLoading } = useProducts();
  const { paymentForms, isLoading: paymentFormsLoading } = usePaymentForms();

  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [saleDetails, setSaleDetails] = useState<SaleDetailDTO[] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isModalLoading, setIsModalLoading] = useState(false);

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
  } = useTableData<Sale>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  useEffect(() => {
    setData(sales);
  }, [sales, setData]);

  const filteredData = useMemo(() => {
    return baseFilteredData.filter((s) => {
      const matchStatus =
        selectedStatus === "all" ||
        s.status === selectedStatus;
      return matchStatus;
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPagesCount = Math.ceil(filteredData.length / rowsPerPage) || 1;

  const handleEditSaleModal = async (sale: Sale | null) => {
    setIsModalLoading(true);
    setSelectedSale(sale);

    if (sale) {
      if (sale.details && sale.details.length > 0) {
        const formattedDetails: SaleDetailDTO[] = sale.details.map((d: any) => ({
          productId: d.product_id,
          quantity: d.quantity,
          unitPrice: d.unit_price,
          discountRate: d.discount_rate,
          taxRate: d.tax_rate,
          unitMeasureId: d.unit_measure_id,
        }));
        setSaleDetails(formattedDetails);
      } else {
        setSaleDetails([]);
      }
    } else {
      setSaleDetails(null);
    }

    setIsModalLoading(false);
    formModal.onOpen();
  };

  const handleViewSaleModal = async (sale: Sale) => {
    setIsModalLoading(true);
    setSelectedSale(sale);

    if (sale.details && sale.details.length > 0) {
      const formattedDetails: SaleDetailDTO[] = sale.details.map((d: any) => ({
        productId: d.product_id,
        quantity: d.quantity,
        unitPrice: d.unit_price,
        discountRate: d.discount_rate,
        taxRate: d.tax_rate,
        unitMeasureId: d.unit_measure_id,
      }));
      setSaleDetails(formattedDetails);
    } else {
      setSaleDetails([]);
    }

    setIsModalLoading(false);
    viewModal.onOpen();
  };

  const columns = useSaleColumns({
    onView: (sale) => handleViewSaleModal(sale),
    onEdit: (sale) => handleEditSaleModal(sale),
    onToggle: (sale) => toggleSaleActiveStatus(sale.id, sale.active),
  });

  const filters = [
    {
      key: "status",
      label: "Estado Venta",
      value: selectedStatus,
      options: [
        { label: "Todos los estados", value: "all" },
        { label: "Pendientes", value: "pending" },
        { label: "Completadas", value: "completed" },
        { label: "Canceladas", value: "cancelled" },
      ],
      onChange: setSelectedStatus,
    },
  ];

  const handleFormSubmit = async (data: CreateSaleDTO) => {
    try {
      if (selectedSale) {
        return await editSale(selectedSale.id, data as any);
      } else {
        return await addSale(data);
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Sale>
        columns={columns}
        createLabel="Nueva Venta"
        data={paginatedData}
        description="Gestiona las ventas, para posterior facturación."
        emptyMessage={
          salesLoading
            ? "Cargando ventas..."
            : salesError
              ? `Error: ${salesError}`
              : "No hay ventas registradas."
        }
        filters={filters}
        icon={ShoppingCart}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por referencia o cliente..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Lista de Ventas"
        title="Gestión de Ventas"
        totalPages={totalPagesCount}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => handleEditSaleModal(null)}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={handleSort}
      />

      <SaleFormModal
        error={salesError}
        isLoading={salesLoading || isModalLoading || customersLoading || productsLoading || paymentFormsLoading}
        isOpen={formModal.isOpen}
        selectedSale={selectedSale}
        saleDetails={saleDetails}
        customers={customers}
        products={products}
        paymentForms={paymentForms}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSale(null);
            setSaleDetails(null);
            clearError();
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
        onChangeStatus={async (status) => {
          if (selectedSale) {
            await changeSaleStatus(selectedSale.id, status);
            // After successful change, we can close the modal or let the user close it
            formModal.onClose();
            setSelectedSale(null);
          }
        }}
      />

      <SaleViewModal
        error={salesError}
        isLoading={salesLoading || isModalLoading || productsLoading}
        isOpen={viewModal.isOpen}
        selectedSale={selectedSale}
        saleDetails={saleDetails}
        products={products}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setSelectedSale(null);
            setSaleDetails(null);
            clearError();
          }
          viewModal.onOpenChange();
        }}
      />
    </>
  );
}
