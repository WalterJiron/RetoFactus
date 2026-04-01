"use client";

import React from "react";
import { Chip } from "@heroui/react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Sale } from "../_types/sales.types";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface SaleColumnsProps {
  onView: (sale: Sale) => void;
  onEdit: (sale: Sale) => void;
  onToggle: (sale: Sale) => void;
  onChangeStatus?: (sale: Sale, status: "completed" | "cancelled") => void;
}

export const useSaleColumns = ({ onView, onEdit, onToggle, onChangeStatus }: SaleColumnsProps) => {
  return [
    {
      key: "reference_code" as keyof Sale,
      label: "Referencia",
      render: (value: string) => (
        <span className="font-semibold font-mono text-gray-900 dark:text-white">
          {value}
        </span>
      ),
    },
    {
      key: "customer_name" as keyof Sale,
      label: "Cliente",
      render: (_: any, sale: Sale) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[150px]">
            {sale.customer_name}
          </span>
          <span className="text-xs text-gray-500">
            {sale.customer_identification}
          </span>
        </div>
      ),
    },
    {
      key: "sale_date" as keyof Sale,
      label: "Fecha",
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "total" as keyof Sale,
      label: "Total",
      render: (value: string | number) => (
        <span className="font-bold text-success-600">
          ${Number(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: "payment_form_name" as keyof Sale,
      label: "Pago",
      render: (value: string) => (
        <span className="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-white dark:border dark:border-primary-500/30 rounded-md text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: "status" as keyof Sale,
      label: "Estado Venta",
      render: (value: string) => {
        switch (value) {
          case "completed":
            return (
              <Chip size="sm" color="success" variant="flat" startContent={<CheckCircle2 className="w-3 h-3" />}>
                Completada
              </Chip>
            );
          case "cancelled":
            return (
              <Chip size="sm" color="danger" variant="flat" startContent={<XCircle className="w-3 h-3" />}>
                Cancelada
              </Chip>
            );
          default:
          case "pending":
            return (
              <Chip size="sm" color="warning" variant="flat" startContent={<Clock className="w-3 h-3" />}>
                Pendiente
              </Chip>
            );
        }
      },
    },
    {
      key: "active" as Extract<keyof Sale, string>,
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value} />,
    },
    {
      key: "actions" as any,
      label: "Acciones",
      sortable: false,
      className: "text-right",
      render: (_: any, sale: Sale) => (
        <ActionButtons
          isActive={sale.active}
          isEditDisabled={!sale.active || sale.status !== "pending"}
          onView={() => onView(sale)}
          onEdit={() => onEdit(sale)}
          onToggle={() => onToggle(sale)}
        />
      ),
    },
  ];
};
