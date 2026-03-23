// app/components/common/ActionButtons.tsx
"use client";

import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Eye, Edit, Trash2, MoreVertical, Power } from "lucide-react";

interface ActionButtonsProps {
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  moreTooltip?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "flat" | "solid" | "ghost";
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  onToggle?: () => void;
  isActive?: boolean;
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onMore,
  onToggle,
  isActive,
  viewTooltip = "Ver detalles",
  editTooltip = "Editar",
  deleteTooltip = "Eliminar",
  moreTooltip = "Más opciones",
  size = "sm",
  variant = "light",
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-1">
      {onView && (
        <Tooltip content={viewTooltip}>
          <Button isIconOnly size={size} variant={variant} onPress={onView}>
            <Eye className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip content={editTooltip}>
          <Button isIconOnly size={size} variant={variant} onPress={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
      {onToggle && (
        <Tooltip content={isActive ? "Desactivar" : "Activar"}>
          <Button
            isIconOnly
            color={isActive ? "danger" : "success"}
            size={size}
            variant={variant}
            onPress={onToggle}
          >
            <Power className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip content={deleteTooltip}>
          <Button
            isIconOnly
            color="danger"
            size={size}
            variant={variant}
            onPress={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
      {onMore && (
        <Tooltip content={moreTooltip}>
          <Button isIconOnly size={size} variant={variant} onPress={onMore}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </Tooltip>
      )}
    </div>
  );
}
