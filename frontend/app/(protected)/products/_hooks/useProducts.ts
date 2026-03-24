"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { Product, ProductDTO } from "../_types/products.types";
import {
  getProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
  activateProductAction,
} from "../_services/products.actions";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProductsAction();

      setProducts(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar productos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addProduct = async (data: ProductDTO) => {
    setIsLoading(true);
    try {
      const res = await createProductAction(data);

      await fetchProducts();
      addToast({
        title: "Éxito",
        description: "Producto creado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al crear producto";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const editProduct = async (id: string, data: ProductDTO) => {
    setIsLoading(true);
    try {
      const res = await updateProductAction(id, data);

      await fetchProducts();
      addToast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al actualizar producto";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const toggleProductStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteProductAction(id);
        addToast({
          title: "Desactivado",
          description: "Producto desactivado",
          color: "warning",
        });
      } else {
        await activateProductAction(id);
        addToast({
          title: "Activado",
          description: "Producto activado",
          color: "success",
        });
      }
      await fetchProducts();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado";

      addToast({ title: "Error", description: msg, color: "danger" });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    refresh: fetchProducts,
    addProduct,
    editProduct,
    toggleProductStatus,
  };
};
