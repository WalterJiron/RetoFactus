"use client";

import React, { useEffect } from "react";
import { Layers } from "lucide-react";
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

import { Category, CategoryDTO } from "../_types/category.types";

interface CategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: Category | null;
  onSubmit: (data: CategoryDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const CategoryFormModal = ({
  isOpen,
  onOpenChange,
  selectedCategory,
  onSubmit,
  isLoading,
  successData,
}: CategoryFormModalProps) => {
  const [formValues, setFormValues] = React.useState({
    nameCategory: "",
    description: "",
  });
  const [errors, setErrors] = React.useState({
    nameCategory: "",
    description: "",
  });

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        nameCategory: selectedCategory?.name ?? "",
        description: selectedCategory?.description ?? "",
      });
      setErrors({ nameCategory: "", description: "" });
    }
  }, [selectedCategory, isOpen, successData]);

  const validate = () => {
    const newErrors = { nameCategory: "", description: "" };
    const name = formValues.nameCategory.trim();
    const desc = formValues.description.trim();

    if (!name)
      newErrors.nameCategory = "El nombre de la categoría es obligatorio";
    else if (name.length < 2 || name.length > 60)
      newErrors.nameCategory = "El nombre debe tener entre 2 y 60 caracteres";

    if (!desc) newErrors.description = "La descripción es obligatoria";
    else if (desc.length < 1)
      newErrors.description = "La descripción no puede estar vacía";

    setErrors(newErrors);

    return !newErrors.nameCategory && !newErrors.description;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      nameCategory: formValues.nameCategory.trim(),
      description: formValues.description.trim(),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedCategory ? "Editar Categoría" : "Nueva Categoría"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedCategory
                    ? `Modificando: ${selectedCategory.name}`
                    : "Registra una nueva categoría de productos"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-4">
              {successData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                      <Layers className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        ¡Operación Exitosa!
                      </h3>
                      <p className="text-sm text-gray-500">
                        La categoría ha sido{" "}
                        {selectedCategory ? "actualizada" : "registrada"}{" "}
                        correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <Input
                    isRequired
                    errorMessage={errors.nameCategory}
                    isInvalid={!!errors.nameCategory}
                    label="Nombre de la Categoría"
                    placeholder="Ej. Electrónica"
                    value={formValues.nameCategory}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, nameCategory: val }))
                    }
                  />
                  <Textarea
                    isRequired
                    errorMessage={errors.description}
                    isInvalid={!!errors.description}
                    label="Descripción"
                    placeholder="Describe los productos de esta categoría..."
                    value={formValues.description}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, description: val }))
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
                    {selectedCategory ? "Guardar Cambios" : "Crear Categoría"}
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
