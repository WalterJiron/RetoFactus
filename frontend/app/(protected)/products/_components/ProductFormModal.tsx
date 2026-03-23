// app/(protected)/products/_components/ProductFormModal.tsx
"use client";

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
import { Plus } from "lucide-react";
import { Product } from "./ProductViewModal";

type ProductFormModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the modal switches to "edit" mode */
  product?: Product | null;
  onSave?: (data: Partial<Product>) => void;
};

export function ProductFormModal({
  isOpen,
  onOpenChange,
  product = null,
  onSave,
}: ProductFormModalProps) {
  const isEditing = Boolean(product);
  const title = isEditing ? "Editar Producto" : "Nuevo Producto";

  return (
    <Modal isOpen={isOpen} size="4xl" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex items-center gap-2 pb-2">
              <Plus className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-bold">{title}</h2>
            </ModalHeader>

            <ModalBody className="gap-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  defaultValue={product?.code_reference ?? ""}
                  label="Código de referencia"
                  placeholder="Ej. SM-G980F"
                  variant="bordered"
                />
                <Input
                  defaultValue={product?.nameproduct ?? ""}
                  label="Nombre del producto"
                  placeholder="Ej. Samsung Galaxy S20"
                  variant="bordered"
                />
              </div>

              <Textarea
                defaultValue={product?.productdescription ?? ""}
                label="Descripción"
                placeholder="Descripción del producto..."
                variant="bordered"
              />

              <div className="grid grid-cols-3 gap-4">
                <Input
                  defaultValue={product?.stock?.toString() ?? ""}
                  label="Stock"
                  placeholder="0"
                  type="number"
                  variant="bordered"
                />
                <Input
                  defaultValue={product?.minstock?.toString() ?? ""}
                  label="Stock mínimo"
                  placeholder="0"
                  type="number"
                  variant="bordered"
                />
                <Input
                  defaultValue={product?.measurementunit?.toString() ?? ""}
                  label="Unidad de medida"
                  placeholder="1"
                  type="number"
                  variant="bordered"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  defaultValue={product?.purchaseprice ?? ""}
                  label="Precio de compra"
                  placeholder="0.00"
                  startContent={
                    <span className="text-gray-400 text-sm">$</span>
                  }
                  type="number"
                  variant="bordered"
                />
                <Input
                  defaultValue={product?.saleprice ?? ""}
                  label="Precio de venta"
                  placeholder="0.00"
                  startContent={
                    <span className="text-gray-400 text-sm">$</span>
                  }
                  type="number"
                  variant="bordered"
                />
              </div>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  onSave?.({});
                  onClose();
                }}
              >
                {isEditing ? "Guardar Cambios" : "Crear Producto"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
