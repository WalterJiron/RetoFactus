"use client";

import React from "react";
import { Spinner } from "@heroui/react";

import { useLoading } from "@/hooks/useLoading";

export function GlobalLoadingIndicator() {
  const { isNavigating } = useLoading();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm transition-all pointer-events-auto">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in duration-300">
        <Spinner
          color="primary"
          label="Cargando página..."
          labelColor="primary"
          size="lg"
        />
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Por favor, espera un momento
        </p>
      </div>
    </div>
  );
}
