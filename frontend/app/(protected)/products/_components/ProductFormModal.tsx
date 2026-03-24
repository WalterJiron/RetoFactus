"use client";

import React, { useEffect } from "react";
import { Package, Tag, Wallet, Box, Info } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Divider,
} from "@heroui/react";

import { Product, ProductDTO } from "../_types/products.types";
import { useSubCategory } from "../../sub-categorys/_hooks/useSubCategory";

interface ProductFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onSubmit: (data: ProductDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const ProductFormModal = ({
  isOpen,
  onOpenChange,
  selectedProduct,
  onSubmit,
  isLoading,
  successData,
}: ProductFormModalProps) => {
  const { subCategories, isLoading: isLoadingSubs } = useSubCategory();

  const [formValues, setFormValues] = React.useState({
    codeReference: "",
    nameProduct: "",
    description: "",
    idSubCategory: "",
    stock: "",
    measurementUnit: "1",
    minStock: "",
    purchasePrice: "",
    salePrice: "",
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        codeReference: selectedProduct?.code_reference ?? "",
        nameProduct: selectedProduct?.nameproduct ?? "",
        description: selectedProduct?.productdescription ?? "",
        idSubCategory: selectedProduct?.idsubcategory?.toString() ?? "",
        stock: selectedProduct?.stock?.toString() ?? "",
        measurementUnit: selectedProduct?.measurementunit?.toString() ?? "1",
        minStock: selectedProduct?.minstock?.toString() ?? "",
        purchasePrice: selectedProduct?.purchaseprice ?? "",
        salePrice: selectedProduct?.saleprice ?? "",
      });
      setErrors({});
    }
  }, [selectedProduct, isOpen, successData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const name = formValues.nameProduct.trim();
    const desc = formValues.description.trim();
    const stock = parseInt(formValues.stock);
    const minStock = parseInt(formValues.minStock);
    const buyPrice = parseFloat(formValues.purchasePrice.replace(/[$,]/g, ""));
    const sellPrice = parseFloat(formValues.salePrice.replace(/[$,]/g, ""));

    if (!name) newErrors.nameProduct = "El nombre es obligatorio";
    else if (name.length < 2 || name.length > 80)
      newErrors.nameProduct = "Debe tener entre 2 y 80 caracteres";

    if (!desc) newErrors.description = "La descripción es obligatoria";

    if (!formValues.idSubCategory)
      newErrors.idSubCategory = "La subcategoría es obligatoria";

    if (isNaN(stock) || stock < 0)
      newErrors.stock = "El stock no puede ser negativo";

    if (isNaN(minStock) || minStock < 0)
      newErrors.minStock = "El stock mínimo no puede ser negativo";

    if (stock < minStock)
      newErrors.stock = "El stock no puede ser menor al stock mínimo";

    if (isNaN(buyPrice) || buyPrice <= 0)
      newErrors.purchasePrice = "El precio debe ser mayor a 0";

    if (isNaN(sellPrice) || sellPrice <= 0)
      newErrors.salePrice = "El precio debe ser mayor a 0";
    else if (sellPrice < buyPrice)
      newErrors.salePrice =
        "El precio de venta no puede ser menor al de compra";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    const buyPrice = parseFloat(formValues.purchasePrice.replace(/[$,]/g, ""));
    const sellPrice = parseFloat(formValues.salePrice.replace(/[$,]/g, ""));

    await onSubmit({
      codeReference: formValues.codeReference.trim() || undefined,
      nameProduct: formValues.nameProduct.trim(),
      description: formValues.description.trim(),
      idSubCategory: parseInt(formValues.idSubCategory),
      stock: parseInt(formValues.stock),
      measurementUnit: parseInt(formValues.measurementUnit),
      minStock: parseInt(formValues.minStock),
      purchasePrice: buyPrice,
      salePrice: sellPrice,
      idDetail: selectedProduct
        ? Number(selectedProduct.iddetailproduct)
        : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="4xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedProduct ? "Editar Producto" : "Nuevo Producto"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedProduct
                    ? `Editando: ${selectedProduct.nameproduct}`
                    : "Registra un nuevo producto en el catálogo"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-6 py-4">
              {successData ? (
                <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300 py-10">
                  <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                    <Package className="h-10 w-10 text-success-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      ¡Operación Exitosa!
                    </h3>
                    <p className="text-sm text-gray-500">
                      El producto ha sido{" "}
                      {selectedProduct ? "actualizado" : "registrado"}{" "}
                      correctamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Left Column: Basic Info */}
                  <div className="md:col-span-12 flex items-center gap-2 mb-[-1rem]">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Información General
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  <Input
                    isRequired
                    className="md:col-span-8"
                    errorMessage={errors.nameProduct}
                    isInvalid={!!errors.nameProduct}
                    label="Nombre del Producto"
                    placeholder="Ej. Laptop Gamer Pro"
                    value={formValues.nameProduct}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, nameProduct: val }))
                    }
                  />

                  <Input
                    className="md:col-span-4"
                    label="Referencia"
                    placeholder="PROD-001"
                    startContent={<Tag className="h-4 w-4 text-gray-400" />}
                    value={formValues.codeReference}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, codeReference: val }))
                    }
                  />

                  <Textarea
                    isRequired
                    className="md:col-span-12"
                    errorMessage={errors.description}
                    isInvalid={!!errors.description}
                    label="Descripción"
                    placeholder="Detalles del producto..."
                    value={formValues.description}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, description: val }))
                    }
                  />

                  <Select
                    isRequired
                    className="md:col-span-12"
                    errorMessage={errors.idSubCategory}
                    isInvalid={!!errors.idSubCategory}
                    isLoading={isLoadingSubs}
                    items={subCategories.filter((s) => s.active)}
                    label="Sub-categoría"
                    placeholder="Selecciona sub-categoría"
                    selectedKeys={
                      formValues.idSubCategory ? [formValues.idSubCategory] : []
                    }
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormValues((v) => ({
                        ...v,
                        idSubCategory: Array.from(keys)[0] as string,
                      }))
                    }
                  >
                    {(sub) => (
                      <SelectItem key={sub.id} textValue={sub.name}>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {sub.name}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {sub.namecategory}
                          </span>
                        </div>
                      </SelectItem>
                    )}
                  </Select>

                  {/* Stock & Prices Section */}
                  <div className="md:col-span-12 flex items-center gap-2 mb-[-1rem] mt-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Precios e Inventario
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  <Input
                    isRequired
                    className="md:col-span-3"
                    errorMessage={errors.purchasePrice}
                    isInvalid={!!errors.purchasePrice}
                    label="Precio Compra"
                    placeholder="0.00"
                    startContent={<span className="text-gray-400">$</span>}
                    step="0.001"
                    type="number"
                    value={formValues.purchasePrice}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, purchasePrice: val }))
                    }
                  />

                  <Input
                    isRequired
                    className="md:col-span-3"
                    errorMessage={errors.salePrice}
                    isInvalid={!!errors.salePrice}
                    label="Precio Venta"
                    placeholder="0.00"
                    startContent={<span className="text-gray-400">$</span>}
                    step="0.001"
                    type="number"
                    value={formValues.salePrice}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, salePrice: val }))
                    }
                  />

                  <Input
                    isRequired
                    className="md:col-span-3"
                    errorMessage={errors.stock}
                    isInvalid={!!errors.stock}
                    label="Stock"
                    startContent={<Box className="h-4 w-4 text-gray-400" />}
                    type="number"
                    value={formValues.stock}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, stock: val }))
                    }
                  />

                  <Input
                    isRequired
                    className="md:col-span-3"
                    errorMessage={errors.minStock}
                    isInvalid={!!errors.minStock}
                    label="Mínimo"
                    type="number"
                    value={formValues.minStock}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, minStock: val }))
                    }
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {successData ? (
                <Button fullWidth color="primary" onPress={onClose}>
                  Entendido
                </Button>
              ) : (
                <>
                  <Button variant="light" onPress={onClose}>
                    Cancelar
                  </Button>
                  <Button color="primary" isLoading={isLoading} type="submit">
                    {selectedProduct ? "Actualizar Producto" : "Crear Producto"}
                  </Button>
                </>
              )}
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
};
