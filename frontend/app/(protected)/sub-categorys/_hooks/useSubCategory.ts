"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { SubCategory, SubCategoryDTO } from "../_types/sub-category.types";
import {
  getSubCategoriesAction,
  createSubCategoryAction,
  updateSubCategoryAction,
  deleteSubCategoryAction,
  activateSubCategoryAction,
} from "../_services/sub-category.actions";

export const useSubCategory = () => {
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSubCategoriesAction();

      setSubCategories(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar sub-categorías");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSubCategory = async (data: SubCategoryDTO) => {
    setIsLoading(true);
    try {
      const res = await createSubCategoryAction(data);

      await fetchSubCategories();
      addToast({
        title: "Éxito",
        description: "Sub-categoría creada correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al crear sub-categoría";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const editSubCategory = async (id: number, data: SubCategoryDTO) => {
    setIsLoading(true);
    try {
      const res = await updateSubCategoryAction(id, data);

      await fetchSubCategories();
      addToast({
        title: "Éxito",
        description: "Sub-categoría actualizada correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al actualizar sub-categoría";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const toggleSubCategoryStatus = async (
    id: number,
    currentStatus: boolean,
  ) => {
    try {
      if (currentStatus) {
        await deleteSubCategoryAction(id);
        addToast({
          title: "Desactivada",
          description: "Sub-categoría desactivada",
          color: "warning",
        });
      } else {
        await activateSubCategoryAction(id);
        addToast({
          title: "Activada",
          description: "Sub-categoría activada",
          color: "success",
        });
      }
      await fetchSubCategories();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado";

      addToast({ title: "Error", description: msg, color: "danger" });
    }
  };

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  return {
    subCategories,
    isLoading,
    error,
    refresh: fetchSubCategories,
    addSubCategory,
    editSubCategory,
    toggleSubCategoryStatus,
  };
};
