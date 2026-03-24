"use client";

import React, { useEffect } from "react";
import { ListTree, LayoutList } from "lucide-react";
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
} from "@heroui/react";

import { SubCategory, SubCategoryDTO } from "../_types/sub-category.types";
import { useCategory } from "../../category/_hooks/useCategory";

interface SubCategoryFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSubCategory: SubCategory | null;
  onSubmit: (data: SubCategoryDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const SubCategoryFormModal = ({
  isOpen,
  onOpenChange,
  selectedSubCategory,
  onSubmit,
  isLoading,
  successData,
}: SubCategoryFormModalProps) => {
  const { categories, isLoading: isLoadingCats } = useCategory();
  const [formValues, setFormValues] = React.useState({
    nameSubCategory: "",
    description: "",
    categorySub: "",
  });
  const [errors, setErrors] = React.useState({
    nameSubCategory: "",
    description: "",
    categorySub: "",
  });

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        nameSubCategory: selectedSubCategory?.name ?? "",
        description: selectedSubCategory?.description ?? "",
        categorySub: selectedSubCategory?.idcategory?.toString() ?? "",
      });
      setErrors({ nameSubCategory: "", description: "", categorySub: "" });
    }
  }, [selectedSubCategory, isOpen, successData]);

  const validate = () => {
    const newErrors = { nameSubCategory: "", description: "", categorySub: "" };
    const name = formValues.nameSubCategory.trim();
    const desc = formValues.description.trim();
    const cat = formValues.categorySub;

    if (!name) {
      newErrors.nameSubCategory = "El nombre de la subcategoría es obligatorio";
    } else if (name.length < 2 || name.length > 60) {
      newErrors.nameSubCategory =
        "El nombre debe tener entre 2 y 60 caracteres";
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s\-_&]+$/.test(name)) {
      newErrors.nameSubCategory = "Solo letras, números, espacios y -_&";
    }

    if (!desc) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!cat) {
      newErrors.categorySub = "La categoría es obligatoria";
    }

    setErrors(newErrors);

    return (
      !newErrors.nameSubCategory &&
      !newErrors.description &&
      !newErrors.categorySub
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      nameSubCategory: formValues.nameSubCategory.trim(),
      description: formValues.description.trim(),
      categorySub: parseInt(formValues.categorySub),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <ListTree className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedSubCategory
                    ? "Editar Sub-categoría"
                    : "Nueva Sub-categoría"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedSubCategory
                    ? `Modificando: ${selectedSubCategory.name}`
                    : "Crea una sub-categoría para organizar mejor tus productos"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-4">
              {successData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                      <ListTree className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        ¡Operación Exitosa!
                      </h3>
                      <p className="text-sm text-gray-500">
                        La sub-categoría ha sido{" "}
                        {selectedSubCategory ? "actualizada" : "registrada"}{" "}
                        correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    isRequired
                    className="md:col-span-2"
                    errorMessage={errors.nameSubCategory}
                    isInvalid={!!errors.nameSubCategory}
                    label="Nombre de la Sub-categoría"
                    placeholder="Ej. Smartphones"
                    value={formValues.nameSubCategory}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, nameSubCategory: val }))
                    }
                  />

                  <Select
                    isRequired
                    className="md:col-span-2"
                    errorMessage={errors.categorySub}
                    isInvalid={!!errors.categorySub}
                    isLoading={isLoadingCats}
                    items={categories.filter((c) => c.active)}
                    label="Categoría Padre"
                    placeholder="Selecciona una categoría"
                    renderValue={(items) => {
                      return items.map((item) => (
                        <div key={item.key} className="flex items-center gap-2">
                          <LayoutList className="h-4 w-4" />
                          <span>{item.data?.name}</span>
                        </div>
                      ));
                    }}
                    selectedKeys={
                      formValues.categorySub ? [formValues.categorySub] : []
                    }
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormValues((v) => ({
                        ...v,
                        categorySub: Array.from(keys)[0] as string,
                      }))
                    }
                  >
                    {(category) => (
                      <SelectItem key={category.id} textValue={category.name}>
                        <div className="flex flex-col">
                          <span className="text-sm">{category.name}</span>
                          <span className="text-[10px] text-gray-400 truncate">
                            {category.description}
                          </span>
                        </div>
                      </SelectItem>
                    )}
                  </Select>

                  <Textarea
                    isRequired
                    className="md:col-span-2"
                    errorMessage={errors.description}
                    isInvalid={!!errors.description}
                    label="Descripción"
                    placeholder="Describe los productos de esta sub-categoría..."
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
                    {selectedSubCategory
                      ? "Guardar Cambios"
                      : "Crear Sub-categoría"}
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
