"use client";

import React, { useEffect } from "react";
import { ShieldCheck } from "lucide-react";
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

import { Role, RoleDTO } from "../_types/roles.types";

interface RoleFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRole: Role | null;
  onSubmit: (data: RoleDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const RoleFormModal = ({
  isOpen,
  onOpenChange,
  selectedRole,
  onSubmit,
  isLoading,
  successData,
}: RoleFormModalProps) => {
  const [formErrors, setFormErrors] = React.useState({
    name: "",
    description: "",
  });
  const [formValues, setFormValues] = React.useState({
    name: "",
    description: "",
  });
  const [touched, setTouched] = React.useState({
    name: false,
    description: false,
  });

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        name: selectedRole?.name_rol ?? "",
        description: selectedRole?.description ?? "",
      });
      setFormErrors({ name: "", description: "" });
      setTouched({ name: false, description: false });
    }
  }, [selectedRole, isOpen, successData]);

  const validateName = (val: string) => {
    const trimmed = val.trim();

    if (!trimmed) return "El nombre del rol es obligatorio";
    if (trimmed.length < 2 || trimmed.length > 50)
      return "El nombre del rol debe tener entre 2 y 50 caracteres";
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(trimmed))
      return "El nombre del rol solo puede contener letras y espacios";

    return "";
  };

  const validateDescription = (val: string) => {
    const trimmed = val.trim();

    if (!trimmed) return "La descripción es obligatoria";
    if (trimmed.length < 5)
      return "La descripción debe tener al menos 5 caracteres";

    return "";
  };

  const handleBlur = (field: "name" | "description") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error =
      field === "name"
        ? validateName(formValues.name)
        : validateDescription(formValues.description);

    setFormErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleValueChange = (field: "name" | "description", value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error =
        field === "name" ? validateName(value) : validateDescription(value);

      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nameError = validateName(formValues.name);
    const descError = validateDescription(formValues.description);

    if (nameError || descError) {
      setFormErrors({ name: nameError, description: descError });
      setTouched({ name: true, description: true });

      return;
    }

    await onSubmit({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
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
                <ShieldCheck className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedRole ? "Editar Rol" : "Nuevo Rol"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedRole
                    ? `Modificando rol: ${selectedRole.name_rol}`
                    : "Define un nuevo rol y su descripción para el sistema"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-4">
              {successData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                      <ShieldCheck className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        ¡Operación Exitosa!
                      </h3>
                      <p className="text-sm text-gray-500">
                        El rol ha sido{" "}
                        {selectedRole ? "actualizado" : "registrado"}{" "}
                        correctamente.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Input
                    isRequired
                    errorMessage={touched.name && formErrors.name}
                    isInvalid={touched.name && !!formErrors.name}
                    label="Nombre del rol"
                    name="name"
                    placeholder="Ej. Administrador"
                    value={formValues.name}
                    variant="bordered"
                    onBlur={() => handleBlur("name")}
                    onValueChange={(val) => handleValueChange("name", val)}
                  />
                  <Textarea
                    isRequired
                    errorMessage={touched.description && formErrors.description}
                    isInvalid={touched.description && !!formErrors.description}
                    label="Descripción"
                    name="description"
                    placeholder="Describe los permisos de este rol..."
                    value={formValues.description}
                    variant="bordered"
                    onBlur={() => handleBlur("description")}
                    onValueChange={(val) =>
                      handleValueChange("description", val)
                    }
                  />
                </>
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
                  <Button
                    color="primary"
                    isDisabled={
                      touched.name &&
                      (!!formErrors.name || !!formErrors.description)
                    }
                    isLoading={isLoading}
                    type="submit"
                  >
                    {selectedRole ? "Guardar Cambios" : "Crear Rol"}
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
