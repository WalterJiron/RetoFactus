// app/(protected)/users/_components/UserColumns.tsx
"use client";

import React from "react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { User } from "../_types/users.types";

interface UserColumnsProps {
  onEdit: (user: User) => void;
  onToggle: (user: User) => void;
}

export const useUserColumns = ({ onEdit, onToggle }: UserColumnsProps) => {
  return [
    {
      key: "name" as keyof User,
      label: "Usuario",
      render: (_: any, user: User) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 dark:text-white">
            {user.name}
          </span>
          <a
            className="text-xs text-primary-500 hover:underline transition-colors"
            href={`mailto:${user.email}`}
          >
            {user.email}
          </a>
        </div>
      ),
    },
    {
      key: "role_name" as keyof User,
      label: "Rol",
      render: (value: string) => (
        <span className="px-2 py-1 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-md text-xs font-medium">
          {value}
        </span>
      ),
    },
    {
      key: "lastlogin" as keyof User,
      label: "Último Acceso",
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {value ? new Date(value).toLocaleDateString() : "Nunca"}
        </span>
      ),
    },
    {
      key: "datecreate" as keyof User,
      label: "Fecha de Creación",
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "active" as keyof User,
      label: "Estado",
      render: (value: boolean) => <StatusBadge status={value} />,
    },
    {
      key: "actions" as any,
      label: "Acciones",
      sortable: false,
      className: "text-right",
      render: (_: any, user: User) => (
        <ActionButtons
          isActive={user.active}
          isEditDisabled={!user.active}
          onEdit={() => onEdit(user)}
          onToggle={() => onToggle(user)}
        />
      ),
    },
  ];
};
