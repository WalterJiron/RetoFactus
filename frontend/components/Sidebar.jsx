// app/components/Sidebar.jsx
"use client";
import { LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Lógica de logout
    router.push("/");
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Header del Sidebar */}
      <header className="p-6 border-b border-gray-200 dark:border-gray-800">
        <article className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Reto Factus
            </h1>
          </div>
        </article>
      </header>

      {/* Menú principal */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {siteConfig.navMenuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <button
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left
                    ${
                      isActive
                        ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 border-l-4 border-primary-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-6 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      <footer className="p-6 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20 transition"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </footer>
    </aside>
  );
}
