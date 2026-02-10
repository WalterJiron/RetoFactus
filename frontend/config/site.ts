import {
  FileText,
  Home,
  Package,
  Settings,
  ShoppingBag,
  UserLock,
  Users,
} from "lucide-react";

export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Reto Factus",
  description: "Sistema de gestion.",

  navMenuItems: [
    { label: "Inicio", icon: Home, path: "/home" },
    { label: "Usuarios", icon: UserLock, path: "/users" },
    { label: "Roles", icon: Settings, path: "/roles" },
    { label: "Productos", icon: Package, path: "/products" },
    { label: "Clientes", icon: Users, path: "/customers" },
    { label: "Ventas", icon: ShoppingBag, path: "/ventas" },
    { label: "Facturación", icon: FileText, path: "/facturacion" },
  ],

  quickAccess: [
    {
      title: "Ventas",
      description: "Gestiona pedidos y transacciones",
      icon: ShoppingBag,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
      href: "/ventas",
      stats: "24 nuevas",
      statColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Productos",
      description: "Administra tu inventario",
      icon: Package,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
      href: "/products",
      stats: "1,240 items",
      statColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Facturación",
      description: "Emite facturas y recibos",
      icon: FileText,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      href: "/facturacion",
      stats: "48 pendientes",
      statColor: "text-purple-600 dark:text-purple-400",
    },
  ],
};
