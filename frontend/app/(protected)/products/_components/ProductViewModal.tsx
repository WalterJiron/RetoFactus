// app/(protected)/products/_components/ProductViewModal.tsx
"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
} from "@heroui/react";
import { Eye } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";

import { Product } from "../_types/products.types";

type ProductViewModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

function DetailField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-gray-900 dark:text-white">
        {children}
      </div>
    </div>
  );
}

function formatPrice(price: string) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(Number(price));
}

export function ProductViewModal({
  isOpen,
  onOpenChange,
  product,
}: ProductViewModalProps) {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} size="4xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 pb-2">
              <Eye className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">Detalles del Producto</h2>
            </ModalHeader>

            <ModalBody className="gap-4">
              {/* Identificación */}
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Código de referencia">
                  <span className="font-mono">{product.code_reference}</span>
                </DetailField>
                <DetailField label="Nombre">{product.nameproduct}</DetailField>
              </div>

              <DetailField label="Descripción">
                {product.productdescription}
              </DetailField>

              {/* Categorización */}
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Categoría">
                  <Chip color="primary" size="sm" variant="flat">
                    {product.namecategory}
                  </Chip>
                </DetailField>
                <DetailField label="Subcategoría">
                  <Chip color="secondary" size="sm" variant="flat">
                    {product.namesubcategory}
                  </Chip>
                </DetailField>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-3 gap-4">
                <DetailField label="Stock actual">
                  {product.stock} unidades
                </DetailField>
                <DetailField label="Stock mínimo">
                  {product.minstock} unidades
                </DetailField>
                <DetailField label="Estado">
                  <StatusBadge status={product.active} />
                </DetailField>
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Precio de compra">
                  <span className="text-blue-600 font-semibold">
                    {formatPrice(product.purchaseprice)}
                  </span>
                </DetailField>
                <DetailField label="Precio de venta">
                  <span className="text-green-600 font-semibold">
                    {formatPrice(product.saleprice)}
                  </span>
                </DetailField>
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
