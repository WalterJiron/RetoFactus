// app/(protected)/customers/_hooks/useCustomers.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { Customer, CustomerDTO } from "../_types/customers.types";
import {
  getCustomersAction,
  createCustomerAction,
  updateCustomerAction,
  deleteCustomerAction,
  activateCustomerAction,
} from "../_services/customers.actions";

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCustomersAction();

      setCustomers(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar clientes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCustomer = async (data: CustomerDTO) => {
    setIsLoading(true);
    try {
      const res = await createCustomerAction(data);

      await fetchCustomers();
      addToast({
        title: "Éxito",
        description: "Cliente registrado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al crear cliente";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const editCustomer = async (id: string, data: CustomerDTO) => {
    setIsLoading(true);
    try {
      const res = await updateCustomerAction(id, data);

      await fetchCustomers();
      addToast({
        title: "Éxito",
        description: "Cliente actualizado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al actualizar cliente";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const toggleCustomerStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteCustomerAction(id);
        addToast({
          title: "Cliente Desactivado",
          description: "El cliente ha sido desactivado correctamente.",
          color: "warning",
        });
      } else {
        await activateCustomerAction(id);
        addToast({
          title: "Cliente Activado",
          description: "El cliente ha sido activado correctamente.",
          color: "success",
        });
      }
      await fetchCustomers();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado del cliente";

      addToast({ title: "Error", description: msg, color: "danger" });
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return {
    customers,
    isLoading,
    error,
    refresh: fetchCustomers,
    addCustomer,
    editCustomer,
    toggleCustomerStatus,
  };
};
