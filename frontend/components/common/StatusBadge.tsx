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
    <Chip color={isActive ? trueColor : falseColor} size={size} variant="flat">
      {isActive ? trueLabel : falseLabel}
    </Chip>
  );
}
