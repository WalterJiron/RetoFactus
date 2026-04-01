// app/(protected)/customers/_components/CustomerFormModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  UserPlus,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Building2,
  CheckCircle2,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Divider,
} from "@heroui/react";

import { Customer, CustomerDTO } from "../_types/customers.types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | null;
  onSubmit: (data: CustomerDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const CustomerFormModal = ({
  isOpen,
  onOpenChange,
  selectedCustomer,
  onSubmit,
  isLoading,
  successData,
}: CustomerFormModalProps) => {
  const [formValues, setFormValues] = useState({
    identification: "",
    names: "",
    address: "",
    email: "",
    phone: "",
    identificationDocumentId: "3",
    municipalityId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        identification: selectedCustomer?.identification ?? "",
        names: selectedCustomer?.names ?? "",
        address: selectedCustomer?.address ?? "",
        email: selectedCustomer?.email ?? "",
        phone: selectedCustomer?.phone ?? "",
        identificationDocumentId:
          selectedCustomer?.identificationdocumentid?.toString() ?? "3",
        municipalityId: selectedCustomer?.municipalityid?.toString() ?? "",
      });
      setErrors({});
    }
  }, [selectedCustomer, isOpen, successData]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    const iden = formValues.identification.trim();

    if (!iden) newErrors.identification = "La identificación es obligatoria";
    else if (iden.length < 3 || iden.length > 50)
      newErrors.identification = "Debe tener entre 3 y 50 caracteres";

    const names = formValues.names.trim();

    if (!names) newErrors.names = "Los nombres son obligatorios";
    else if (names.length < 2 || names.length > 100)
      newErrors.names = "Debe tener entre 2 y 100 caracteres";

    const addr = formValues.address.trim();

    if (!addr) newErrors.address = "La dirección es obligatoria";
    else if (!/\S/.test(addr))
      newErrors.address = "La dirección no puede estar vacía";

    const email = formValues.email.trim();

    if (!email) newErrors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Formato de email inválido";

    const phone = formValues.phone.trim();

    if (!phone) newErrors.phone = "El teléfono es obligatorio";
    else if (!/^[0-9\s\-+()]+$/.test(phone))
      newErrors.phone =
        "Formato de teléfono inválido (Use dígito, +, -, (), espacio)";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      identification: formValues.identification.trim(),
      names: formValues.names.trim(),
      address: formValues.address.trim(),
      email: formValues.email.trim().toLowerCase(),
      phone: formValues.phone.trim(),
      identificationDocumentId:
        parseInt(formValues.identificationDocumentId) || 3,
      municipalityId: formValues.municipalityId
        ? parseInt(formValues.municipalityId)
        : undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <form onSubmit={handleSubmit}>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedCustomer ? "Editar Cliente" : "Nuevo Cliente"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedCustomer
                    ? `Editando: ${selectedCustomer.names}`
                    : "Registra un nuevo cliente en el sistema"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-6 pb-6">
              {successData ? (
                <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300 py-10">
                  <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                    <CheckCircle2 className="h-10 w-10 text-success-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      ¡Operación Exitosa!
                    </h3>
                    <p className="text-sm text-gray-500">
                      El cliente ha sido{" "}
                      {selectedCustomer ? "actualizado" : "registrado"}{" "}
                      correctamente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-12 flex items-center gap-2 mb-[-0.5rem]">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
                      Información de Identidad
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  <Input
                    isRequired
                    className="md:col-span-6"
                    errorMessage={errors.identification}
                    isInvalid={!!errors.identification}
                    label="Identificación"
                    placeholder="Ej. 123456789"
                    startContent={<IdCard className="h-4 w-4 text-gray-400" />}
                    value={formValues.identification}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, identification: v }))
                    }
                  />

                  <Input
                    isRequired
                    className="md:col-span-6"
                    errorMessage={errors.names}
                    isInvalid={!!errors.names}
                    label="Nombres Completos"
                    placeholder="Ej. Juan Pérez"
                    value={formValues.names}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, names: v }))
                    }
                  />

                  <div className="md:col-span-12 flex items-center gap-2 mb-[-0.5rem] mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
                      Información de Contacto
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  <Input
                    isRequired
                    className="md:col-span-7"
                    errorMessage={errors.email}
                    isInvalid={!!errors.email}
                    label="Correo Electrónico"
                    placeholder="ejemplo@correo.com"
                    startContent={<Mail className="h-4 w-4 text-gray-400" />}
                    type="email"
                    value={formValues.email}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, email: v }))
                    }
                  />

                  <Input
                    isRequired
                    className="md:col-span-5"
                    errorMessage={errors.phone}
                    isInvalid={!!errors.phone}
                    label="Teléfono"
                    placeholder="+505 0000-0000"
                    startContent={<Phone className="h-4 w-4 text-gray-400" />}
                    value={formValues.phone}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, phone: v }))
                    }
                  />

                  <Textarea
                    isRequired
                    className="md:col-span-12"
                    errorMessage={errors.address}
                    isInvalid={!!errors.address}
                    label="Dirección Completa"
                    placeholder="Calle, Número, Barrio..."
                    startContent={
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    }
                    value={formValues.address}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, address: v }))
                    }
                  />

                  <div className="md:col-span-12 flex items-center gap-2 mb-[-0.5rem] mt-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-500">
                      Configuración Adicional
                    </span>
                    <Divider className="flex-1" />
                  </div>

                  <Input
                    className="md:col-span-6"
                    label="Municipio ID"
                    placeholder="Ej. 5"
                    type="number"
                    value={formValues.municipalityId}
                    variant="bordered"
                    onValueChange={(v) =>
                      setFormValues((prev) => ({ ...prev, municipalityId: v }))
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
                    {selectedCustomer ? "Actualizar Cliente" : "Crear Cliente"}
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
