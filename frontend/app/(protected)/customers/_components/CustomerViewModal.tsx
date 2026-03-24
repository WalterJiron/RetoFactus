// app/(protected)/customers/_components/CustomerViewModal.tsx
"use client";

import React from "react";
import {
  Eye,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Building2,
  Calendar,
  CreditCard,
} from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";

import { StatusBadge } from "@/components/common/StatusBadge";

import { Customer } from "../_types/customers.types";

interface CustomerViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
}

const DetailItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col gap-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
    <div className="flex items-center gap-2 text-gray-500">
      <Icon className="h-3.5 w-3.5" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
      {value || "Sin información"}
    </span>
  </div>
);

export const CustomerViewModal = ({
  isOpen,
  onOpenChange,
  customer,
}: CustomerViewModalProps) => {
  if (!customer) return null;

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="3xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detalles del Cliente
                </h2>
              </div>
              <p className="text-xs font-normal text-gray-500">
                Vista detallada de la información del cliente registrado
              </p>
            </ModalHeader>
            <ModalBody className="gap-6 py-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 border-4 border-primary-50">
                  <IdCard className="h-10 w-10" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                      {customer.names.toLowerCase()}
                    </h3>
                    <StatusBadge status={customer.active} />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CreditCard className="h-4 w-4" />
                    <span>ID Tributario: {customer.identification}</span>
                  </div>
                </div>
              </div>

              <Divider />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailItem
                  icon={Mail}
                  label="Correo Electrónico"
                  value={customer.email.toLowerCase()}
                />
                <DetailItem
                  icon={Phone}
                  label="Teléfono de Contacto"
                  value={customer.phone}
                />
                <div className="md:col-span-2">
                  <DetailItem
                    icon={MapPin}
                    label="Dirección Fiscal"
                    value={customer.address}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DetailItem
                  icon={Building2}
                  label="Establecimiento"
                  value={customer.establishmentname}
                />
                <DetailItem
                  icon={Calendar}
                  label="Registrado el"
                  value={new Date(customer.datecreate).toLocaleDateString(
                    "es-NI",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
                />
                <DetailItem
                  icon={CreditCard}
                  label="Total Ventas"
                  value={`C$ ${customer.totalsalesinestablishment}`}
                />
              </div>

              <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-800/20">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary-600 mb-3">
                  IDs Técnicos
                </h4>
                <div className="flex gap-4 flex-wrap">
                  <Chip color="primary" size="sm" variant="dot">
                    Doc: {customer.identificationdocumentid}
                  </Chip>
                  <Chip color="secondary" size="sm" variant="dot">
                    Mun: {customer.municipalityid}
                  </Chip>
                  <Chip color="success" size="sm" variant="dot">
                    Trib: {customer.tributeid}
                  </Chip>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button className="px-10" color="primary" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
