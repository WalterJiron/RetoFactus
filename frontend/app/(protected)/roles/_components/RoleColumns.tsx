import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Role } from "../_types/roles.types";

export const getRoleColumns = (
  onEdit: (role: Role) => void,
  onToggle: (id: number, currentStatus: boolean) => void,
) => [
  {
    key: "id" as keyof Role,
    label: "ID",
    render: (value: number) => (
      <span className="font-mono font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    ),
  },
  {
    key: "name_rol" as keyof Role,
    label: "Rol",
    render: (value: string) => (
      <span className="font-semibold text-gray-900 dark:text-white">
        {value}
      </span>
    ),
  },
  {
    key: "description" as keyof Role,
    label: "Descripción",
    render: (value: string) => (
      <span className="text-sm text-gray-500">{value}</span>
    ),
  },
  {
    key: "active" as keyof Role,
    label: "Estado",
    render: (value: boolean) => <StatusBadge status={value} />,
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, role: Role) => (
      <ActionButtons
        isActive={role.active}
        isEditDisabled={false}
        onEdit={() => onEdit(role)}
        onToggle={() => onToggle(role.id, role.active)}
      />
    ),
  },
];
