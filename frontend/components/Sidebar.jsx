// app/components/Sidebar.jsx
"use client";
import { LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

import { useLoading } from "@/hooks/useLoading";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { navigate } = useLoading();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <aside className="w-32 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Header */}
      <header className="py-4 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-sm font-bold text-gray-900 dark:text-white text-center px-2">
          Reto Factus
        </h1>
      </header>

      {/* Menú principal - desplazable si es necesario */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-2">
          {siteConfig.navMenuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex flex-col items-center justify-center gap-1.5 py-2 px-1 rounded-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 ring-1 ring-primary-200 dark:ring-primary-800"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:scale-105"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                  title={item.label}
                >
                  <Icon className="h-6 w-6 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-medium text-center leading-tight">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - Cerrar sesión */}
      <footer className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex flex-col items-center justify-center gap-2 py-2 px-1 rounded-lg text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-all duration-200 text-sm font-medium group"
          title="Cerrar sesión"
        >
          <LogOut className="h-8 w-8 transition-transform group-hover:scale-110" />
        </button>
      </footer>
    </aside>
  );
}