// app/(protected)/customers/_components/CustomerColumns.tsx
"use client";

import React from "react";
import { UserRound, Mail, MapPin, Phone, IdCard, Store } from "lucide-react";
import { Tooltip } from "@heroui/react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Customer } from "../_types/customers.types";

interface CustomerColumnsProps {
  onEdit: (customer: Customer) => void;
  onToggle: (customer: Customer) => void;
  onView: (customer: Customer) => void;
}

export const getCustomerColumns = ({
  onEdit,
  onToggle,
  onView,
}: CustomerColumnsProps) => [
  {
    key: "names" as keyof Customer,
    label: "Cliente",
    render: (_: any, customer: Customer) => (
      <div className="flex items-center gap-4 group">
        <div className="h-10 w-10 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform duration-200 shadow-sm border border-primary-200/50 dark:border-primary-800/30">
          <UserRound className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white capitalize tracking-tight">
            {customer.names.toLowerCase()}
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <IdCard className="h-3 w-3 text-gray-400" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              ID: {customer.identification}
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "contact" as any,
    label: "Contacto",
    render: (_: any, customer: Customer) => (
      <div className="flex flex-col gap-2 py-1">
        <div className="flex items-center gap-2 group/item">
          <div className="p-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover/item:text-primary-500 transition-colors">
            <Mail className="h-3.5 w-3.5" />
          </div>
          <a
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate max-w-[150px]"
            href={`mailto:${customer.email}`}
            title={customer.email}
          >
            {customer.email.toLowerCase()}
          </a>
        </div>
        <div className="flex items-center gap-2 group/item">
          <div className="p-1 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover/item:text-green-500 transition-colors">
            <Phone className="h-3.5 w-3.5" />
          </div>
          <a
            href={`https://wa.me/${customer.phone.replace(/\D/g, "")}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {customer.phone}
            </span>
          </a>
        </div>
      </div>
    ),
  },
  {
    key: "address" as keyof Customer,
    label: "Dirección",
    render: (val: string) => (
      <Tooltip
        showArrow
        className="max-w-[300px] text-xs"
        closeDelay={0}
        content={val}
        delay={500}
      >
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 max-w-[180px] p-2 rounded-lg bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all cursor-default">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-primary-500/70" />
          <span className="truncate">{val}</span>
        </div>
      </Tooltip>
    ),
  },
  {
    key: "establishmentname" as keyof Customer,
    label: "Sucursal",
    render: (val: string) => (
      <div className="flex items-center gap-2.5 py-1 px-3 w-fit rounded-xl bg-secondary-50/50 dark:bg-secondary-900/20 border border-secondary-100 dark:border-secondary-800/30 transition-all hover:bg-secondary-100/50 dark:hover:bg-secondary-900/40 cursor-default">
        <div className="h-6 w-6 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-600 dark:text-secondary-400 shadow-sm">
          <Store className="h-3.5 w-3.5" />
        </div>
        <span className="text-[11px] font-bold dark:text-secondary-900 tracking-wide uppercase">
          {val || "N/A"}
        </span>
      </div>
    ),
  },
  {
    key: "active" as keyof Customer,
    label: "Estado",
    render: (value: boolean) => (
      <div className="flex justify-center w-full">
        <StatusBadge status={value} />
      </div>
    ),
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, customer: Customer) => (
      <ActionButtons
        isActive={customer.active}
        onEdit={() => onEdit(customer)}
        onToggle={() => onToggle(customer)}
        onView={() => onView(customer)}
      />
    ),
  },
];
