"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { Category, CategoryDTO } from "../_types/category.types";
import {
  getCategoriesAction,
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  activateCategoryAction,
} from "../_services/category.actions";

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCategoriesAction();

      setCategories(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar categorías");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCategory = async (data: CategoryDTO) => {
    setIsLoading(true);
    try {
      const res = await createCategoryAction(data);

      await fetchCategories();
      addToast({
        title: "Éxito",
        description: "Categoría creada correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al crear categoría";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const editCategory = async (id: number, data: CategoryDTO) => {
    setIsLoading(true);
    try {
      const res = await updateCategoryAction(id, data);

      await fetchCategories();
      addToast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al actualizar categoría";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteCategoryAction(id);
        addToast({
          title: "Desactivado",
          description: "Categoría desactivada",
          color: "warning",
        });
      } else {
        await activateCategoryAction(id);
        addToast({
          title: "Activado",
          description: "Categoría activada",
          color: "success",
        });
      }
      await fetchCategories();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado";

      addToast({ title: "Error", description: msg, color: "danger" });
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    isLoading,
    error,
    refresh: fetchCategories,
    addCategory,
    editCategory,
    toggleCategoryStatus,
  };
};
