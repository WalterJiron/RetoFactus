// app/components/common/StatusBadge.tsx
"use client";

import React from "react";
import { Chip } from "@heroui/react";

interface StatusBadgeProps {
  status: boolean | string;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: "success" | "primary" | "secondary" | "warning" | "danger";
  falseColor?: "success" | "primary" | "secondary" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  trueLabel = "Activo",
  falseLabel = "Inactivo",
  trueColor = "success",
  falseColor = "danger",
  size = "sm",
}: StatusBadgeProps) {
  const isActive =
    typeof status === "boolean"
      ? status
      : status === "true" || status === "active";

  return (
    <Chip size={size} variant="flat" color={isActive ? trueColor : falseColor}>
      {isActive ? trueLabel : falseLabel}
    </Chip>
  );
}
