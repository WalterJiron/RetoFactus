"use client";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Category } from "../_types/category.types";

export const getCategoryColumns = (
  onEdit: (cat: Category) => void,
  onToggle: (id: number, status: boolean) => void,
) => [
  {
    key: "id" as keyof Category,
    label: "ID",
    render: (val: number) => <span className="font-mono text-xs">{val}</span>,
  },
  {
    key: "name" as keyof Category,
    label: "Nombre",
    render: (val: string) => <span className="font-semibold">{val}</span>,
  },
  {
    key: "description" as keyof Category,
    label: "Descripción",
    render: (val: string) => (
      <p className="text-sm text-gray-500 truncate max-w-md">{val}</p>
    ),
  },
  {
    key: "datecreate" as keyof Category,
    label: "Fecha de Creación",
    render: (val: string) => (
      <span className="text-[10px] text-gray-400">
        {new Date(val).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "active" as keyof Category,
    label: "Estado",
    render: (value: boolean) => <StatusBadge status={value} />,
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, cat: Category) => (
      <ActionButtons
        isActive={cat.active}
        onEdit={() => onEdit(cat)}
        onToggle={() => onToggle(cat.id, cat.active)}
      />
    ),
  },
];
