"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { Sale, CreateSaleDTO, UpdateSaleDTO, SaleStatus } from "../_types/sales.types";
import {
  getSalesAction,
  createSaleAction,
  updateSaleAction,
  updateSaleStatusAction,
  deleteSaleAction,
  activateSaleAction,
} from "../_services/sales.actions";

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getSalesAction();
      setSales(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch sales");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addSale = async (data: CreateSaleDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createSaleAction(data);
      await fetchSales();
      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to create sale";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const editSale = async (id: number, data: UpdateSaleDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateSaleAction(id, data);
      await fetchSales();
      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to update sale";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const changeSaleStatus = async (id: number, status: SaleStatus) => {
    try {
      await updateSaleStatusAction(id, status);
      await fetchSales();
      
      const statusES = status === "completed" ? "Completada" : "Cancelada";
      const color = status === "completed" ? "success" : "warning";
      
      addToast({
        title: `Venta ${statusES}`,
        description: `El estado de la venta se actualizó a ${statusES}.`,
        color,
      });
    } catch (err: any) {
      setError(err.message || "Failed to change sale status");
      addToast({
        title: "Error de Operación",
        description: err.message || "No se pudo actualizar el estado de la venta.",
        color: "danger",
      });
      throw err;
    }
  };

  const toggleSaleActiveStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteSaleAction(id);
        addToast({
          title: "Venta Eliminada",
          description: "La venta ha sido marcada como inactiva.",
          color: "warning",
        });
      } else {
        await activateSaleAction(id);
        addToast({
          title: "Venta Restaurada",
          description: "La venta ha sido reactivada.",
          color: "success",
        });
      }
      await fetchSales();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado activo de la venta";
      setError(msg);
      addToast({
        title: "Error de Operación",
        description: msg,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const clearError = () => setError(null);

  return {
    sales,
    isLoading,
    error,
    clearError,
    refresh: fetchSales,
    addSale,
    editSale,
    changeSaleStatus,
    toggleSaleActiveStatus,
  };
};
