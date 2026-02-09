// app/components/common/ActionButtons.tsx
"use client";

import React from "react";
import { Button, Tooltip } from "@heroui/react";
import { Eye, Edit, Trash2, MoreVertical } from "lucide-react";

interface ActionButtonsProps {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onMore?: () => void;
  viewTooltip?: string;
  editTooltip?: string;
  deleteTooltip?: string;
  moreTooltip?: string;
  size?: "sm" | "md" | "lg";
  variant?: "light" | "flat" | "solid" | "ghost";
}

export function ActionButtons({
  onView,
  onEdit,
  onDelete,
  onMore,
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
      {onDelete && (
        <Tooltip content={deleteTooltip}>
          <Button
            isIconOnly
            size={size}
            variant={variant}
            color="danger"
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
