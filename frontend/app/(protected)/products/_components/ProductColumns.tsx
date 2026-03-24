"use client";

import { Tag, Layers } from "lucide-react";
import { Chip } from "@heroui/react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Product } from "../_types/products.types";

const formatPrice = (price: string) => {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
  }).format(Number(price));
};

export const getProductColumns = (
  onEdit: (prod: Product) => void,
  onToggle: (id: string, status: boolean) => void,
  onView: (prod: Product) => void,
) => [
  {
    key: "nameproduct" as keyof Product,
    label: "Producto",
    render: (_: any, prod: Product) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-900 dark:text-white">
          {prod.nameproduct}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <Tag className="h-2.5 w-2.5" />
          <span>{prod.code_reference}</span>
        </div>
      </div>
    ),
  },
  {
    key: "category" as any,
    label: "Categorización",
    render: (_: any, prod: Product) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1 text-xs text-primary-600 font-medium">
          <Layers className="h-3 w-3" />
          <span>{prod.namesubcategory}</span>
        </div>
        <span className="text-[10px] text-gray-400 italic">
          {prod.namecategory}
        </span>
      </div>
    ),
  },
  {
    key: "stock" as keyof Product,
    label: "Inventario",
    render: (val: number, prod: Product) => (
      <div className="flex flex-col gap-1">
        <Chip
          className="font-mono"
          color={val <= prod.minstock ? "danger" : "success"}
          size="sm"
          variant="flat"
        >
          {val} disp.
        </Chip>
        <span className="text-[10px] text-gray-400">Min: {prod.minstock}</span>
      </div>
    ),
  },
  {
    key: "prices" as any,
    label: "Precios",
    render: (_: any, prod: Product) => (
      <div className="flex flex-col">
        <span className="text-sm font-bold text-success-600">
          {formatPrice(prod.saleprice)}
        </span>
        <span className="text-[10px] text-gray-400 line-through decoration-danger/30">
          {formatPrice(prod.purchaseprice)}
        </span>
      </div>
    ),
  },
  {
    key: "active" as keyof Product,
    label: "Estado",
    render: (value: boolean) => <StatusBadge status={value} />,
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, prod: Product) => (
      <ActionButtons
        isActive={prod.active}
        onEdit={() => onEdit(prod)}
        onToggle={() => onToggle(prod.idproduct, prod.active)}
        onView={() => onView(prod)}
      />
    ),
  },
];
