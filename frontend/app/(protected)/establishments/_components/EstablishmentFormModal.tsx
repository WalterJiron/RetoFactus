"use client";

import React, { useEffect } from "react";
import { Store } from "lucide-react";
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

import {
  Establishment,
  EstablishmentDTO,
} from "../_types/establishments.types";

interface EstablishmentFormModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEstablishment: Establishment | null;
  onSubmit: (data: EstablishmentDTO) => Promise<any>;
  isLoading: boolean;
  successData: any;
}

export const EstablishmentFormModal = ({
  isOpen,
  onOpenChange,
  selectedEstablishment,
  onSubmit,
  isLoading,
  successData,
}: EstablishmentFormModalProps) => {
  const [formValues, setFormValues] = React.useState({
    name: "",
    address: "",
    phoneNumber: "",
    email: "",
    municipalityId: "1",
  });

  useEffect(() => {
    if (isOpen && !successData) {
      setFormValues({
        name: selectedEstablishment?.name ?? "",
        address: selectedEstablishment?.address ?? "",
        phoneNumber: selectedEstablishment?.phone_number ?? "",
        email: selectedEstablishment?.email ?? "",
        municipalityId:
          selectedEstablishment?.municipality_id?.toString() ?? "1",
      });
    }
  }, [selectedEstablishment, isOpen, successData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({
      ...formValues,
      municipalityId: parseInt(formValues.municipalityId),
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
                <Store className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold">
                  {selectedEstablishment
                    ? "Editar Establecimiento"
                    : "Nuevo Establecimiento"}
                </h2>
              </div>
              {!successData && (
                <p className="text-xs font-normal text-gray-500">
                  {selectedEstablishment
                    ? `Modificando: ${selectedEstablishment.name}`
                    : "Registra un nuevo punto de venta en el sistema"}
                </p>
              )}
            </ModalHeader>
            <ModalBody className="gap-4">
              {successData ? (
                <div className="space-y-6 py-4">
                  <div className="flex flex-col items-center text-center gap-3 animate-in fade-in zoom-in duration-300">
                    <div className="h-16 w-16 bg-success-100 rounded-full flex items-center justify-center border-4 border-success-50">
                      <Store className="h-10 w-10 text-success-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        ¡Operación Exitosa!
                      </h3>
                      <p className="text-sm text-gray-500">
                        El establecimiento ha sido{" "}
                        {selectedEstablishment ? "actualizado" : "registrado"}{" "}
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
                    label="Nombre del Establecimiento"
                    placeholder="Ej. Sucursal Central"
                    value={formValues.name}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, name: val }))
                    }
                  />
                  <Input
                    isRequired
                    label="Correo Electrónico"
                    placeholder="sucursal@empresa.com"
                    type="email"
                    value={formValues.email}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, email: val }))
                    }
                  />
                  <Input
                    isRequired
                    label="Teléfono"
                    placeholder="+505 0000-0000"
                    value={formValues.phoneNumber}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, phoneNumber: val }))
                    }
                  />
                  <Textarea
                    isRequired
                    className="md:col-span-2"
                    label="Dirección Completa"
                    placeholder="Calle, Número, Referencia..."
                    value={formValues.address}
                    variant="bordered"
                    onValueChange={(val) =>
                      setFormValues((v) => ({ ...v, address: val }))
                    }
                  />
                  <Select
                    isRequired
                    label="Municipio (ID)"
                    placeholder="Seleccione municipio"
                    selectedKeys={[formValues.municipalityId]}
                    variant="bordered"
                    onSelectionChange={(keys) =>
                      setFormValues((v) => ({
                        ...v,
                        municipalityId: Array.from(keys)[0] as string,
                      }))
                    }
                  >
                    <SelectItem key="1" value="1">
                      Municipio 1
                    </SelectItem>
                    <SelectItem key="2" value="2">
                      Municipio 2
                    </SelectItem>
                    <SelectItem key="5" value="5">
                      Municipio 5
                    </SelectItem>
                  </Select>
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
                    {selectedEstablishment
                      ? "Guardar Cambios"
                      : "Crear Establecimiento"}
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
