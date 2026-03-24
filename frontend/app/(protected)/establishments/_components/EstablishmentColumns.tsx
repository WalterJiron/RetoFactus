import { MapPin, Phone, Mail, Users, Shield, Package } from "lucide-react";

import { StatusBadge } from "@/components/common/StatusBadge";
import { ActionButtons } from "@/components/common/ActionButtons";

import { Establishment } from "../_types/establishments.types";

export const getEstablishmentColumns = (
  onEdit: (est: Establishment) => void,
  onDelete: (id: number) => void,
) => [
  {
    key: "name" as keyof Establishment,
    label: "Establecimiento",
    render: (_: any, est: Establishment) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold text-gray-900 dark:text-white">
          {est.name}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="h-3 w-3" />
          <span className="truncate max-w-[200px]">{est.address}</span>
        </div>
      </div>
    ),
  },
  {
    key: "contact" as any,
    label: "Contacto",
    render: (_: any, est: Establishment) => (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Phone className="h-3 w-3 text-primary-500" />
          <a
            className="hover:underline"
            href={`https://wa.me/${est.phone_number.replace(/\D/g, "")}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {est.phone_number}
          </a>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
          <Mail className="h-3 w-3 text-primary-500" />
          <a
            className="hover:underline"
            href={`mailto:${est.email}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            {est.email}
          </a>
        </div>
      </div>
    ),
  },
  {
    key: "stats" as any,
    label: "Estadísticas",
    render: (_: any, est: Establishment) => (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-xs" title="Usuarios">
          <Users className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium">{est.users_count}</span>
        </div>
        <div className="flex items-center gap-1 text-xs" title="Roles">
          <Shield className="h-3.5 w-3.5 text-purple-500" />
          <span className="font-medium">{est.roles_count}</span>
        </div>
        <div className="flex items-center gap-1 text-xs" title="Productos">
          <Package className="h-3.5 w-3.5 text-orange-500" />
          <span className="font-medium">{est.products_count}</span>
        </div>
      </div>
    ),
  },
  {
    key: "active" as keyof Establishment,
    label: "Estado",
    render: (value: boolean) => <StatusBadge status={value} />,
  },
  {
    key: "actions" as any,
    label: "Acciones",
    sortable: false,
    className: "text-right",
    render: (_: any, est: Establishment) => (
      <ActionButtons
        isActive={est.active}
        onDelete={() => onDelete(est.idestablishment)}
        onEdit={() => onEdit(est)}
      />
    ),
  },
];
