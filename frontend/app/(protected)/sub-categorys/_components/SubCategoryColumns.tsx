"use client";

import { Layers } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { SubCategory } from "../_types/sub-category.types";

export const getSubCategoryColumns = (
  onEdit: (sub: SubCategory) => void,
  onToggle: (id: number, status: boolean) => void,
) => [
  {
    key: "name" as keyof SubCategory,
    label: "Sub-Categoría",
    render: (_: any, sub: SubCategory) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{sub.name}</span>
        <div className="flex items-center gap-1 text-[10px] text-gray-500">
          <Layers className="h-2.5 w-2.5" />
          <span>{sub.namecategory}</span>
        </div>
      </div>
    ),
  },
  {
    key: "description" as keyof SubCategory,
    label: "Descripción",
    render: (val: string) => (
      <p className="text-sm text-gray-500 truncate max-w-sm">{val}</p>
    ),
  },
  {
    key: "datecreate" as keyof SubCategory,
    label: "Creada el",
    render: (val: string) => (
      <span className="text-[10px] text-gray-400">
        {new Date(val).toLocaleDateString()}
      </span>
    ),
  },
  {
    key: "active" as keyof SubCategory,
    label: "Estado",
    render: (value: boolean) => <StatusBadge status={value} />,
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, sub: SubCategory) => (
      <ActionButtons
        isActive={sub.active}
        onEdit={() => onEdit(sub)}
        onToggle={() => onToggle(sub.id, sub.active)}
      />
    ),
  },
];
