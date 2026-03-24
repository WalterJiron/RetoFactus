"use client";

import React, { useEffect } from "react";
import { Package } from "lucide-react";
import { useDisclosure } from "@heroui/react";

import { PageTemplate } from "@/components/common/PageTemplate";
import { useTableData } from "@/hooks/useTableData";

import { useProducts } from "./_hooks/useProducts";
import { Product } from "./_types/products.types";
import { getProductColumns } from "./_components/ProductColumns";
import { ProductFormModal } from "./_components/ProductFormModal";
import { ProductViewModal } from "./_components/ProductViewModal";

export default function ProductsPage() {
  const formModal = useDisclosure();
  const detailModal = useDisclosure();

  const {
    products,
    isLoading,
    error,
    addProduct,
    editProduct,
    toggleProductStatus,
  } = useProducts();

  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(
    null,
  );
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
  } = useTableData<Product>({
    initialData: [],
    initialPage: 1,
    initialRowsPerPage: 10,
  });

  // Sync hook data to table data
  useEffect(() => {
    setData(products);
  }, [products, setData]);

  const filteredData = React.useMemo(() => {
    return baseFilteredData.filter((p) => {
      const matchStatus =
        selectedStatus === "all" ||
        (selectedStatus === "active" && p.active) ||
        (selectedStatus === "inactive" && !p.active);

      return matchStatus;
    });
  }, [baseFilteredData, selectedStatus]);

  const paginatedData = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;

    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const columns = getProductColumns(
    (prod) => {
      setSuccessData(null);
      setSelectedProduct(prod);
      formModal.onOpen();
    },
    toggleProductStatus,
    (prod) => {
      setSelectedProduct(prod);
      detailModal.onOpen();
    },
  );

  const filters = [
    {
      key: "status",
      label: "Estado",
      value: selectedStatus,
      options: [
        { label: "Todos los estados", value: "all" },
        { label: "Disponibles", value: "active" },
        { label: "Inactivos", value: "inactive" },
      ],
      onChange: setSelectedStatus,
    },
  ];

  const handleFormSubmit = async (data: any) => {
    try {
      let response;

      if (selectedProduct) {
        response = await editProduct(selectedProduct.idproduct, data);
      } else {
        response = await addProduct(data);
      }
      setSuccessData(response);

      return response;
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <PageTemplate<Product>
        columns={columns}
        createLabel="Nuevo Producto"
        data={paginatedData}
        description="Gestiona el inventario de productos y sus precios"
        emptyMessage={
          isLoading
            ? "Cargando catálogo..."
            : error
              ? `Error: ${error}`
              : "No se encontraron productos"
        }
        filters={filters}
        icon={Package}
        isLoading={isLoading}
        page={page}
        rowsPerPage={rowsPerPage}
        searchPlaceholder="Buscar por nombre o código..."
        searchTerm={searchTerm}
        sortConfig={sortConfig}
        tableTitle="Inventario de Productos"
        title="Productos"
        totalPages={totalPages}
        onClearFilters={() => {
          setSearchTerm("");
          setSelectedStatus("all");
        }}
        onCreateClick={() => {
          setSuccessData(null);
          setSelectedProduct(null);
          formModal.onOpen();
        }}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        onSearchChange={setSearchTerm}
        onSort={(key) => handleSort(key)}
      />

      <ProductFormModal
        isLoading={isLoading}
        isOpen={formModal.isOpen}
        selectedProduct={selectedProduct}
        successData={successData}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedProduct(null);
            setSuccessData(null);
          }
          formModal.onOpenChange();
        }}
        onSubmit={handleFormSubmit}
      />

      <ProductViewModal
        isOpen={detailModal.isOpen}
        product={selectedProduct}
        onOpenChange={detailModal.onOpenChange}
      />
    </>
  );
}
