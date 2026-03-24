"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import {
  Establishment,
  EstablishmentDTO,
} from "../_types/establishments.types";
import {
  getEstablishmentsAction,
  createEstablishmentAction,
  updateEstablishmentAction,
  deleteEstablishmentAction,
} from "../_services/establishments.actions";

export const useEstablishments = () => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEstablishments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getEstablishmentsAction();

      setEstablishments(data || []);
    } catch (err: any) {
      setError(err.message || "Error al cargar establecimientos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addEstablishment = async (data: EstablishmentDTO) => {
    setIsLoading(true);
    try {
      const res = await createEstablishmentAction(data);

      await fetchEstablishments();
      addToast({
        title: "Éxito",
        description: "Establecimiento creado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al crear establecimiento";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const editEstablishment = async (id: number, data: EstablishmentDTO) => {
    setIsLoading(true);
    try {
      const res = await updateEstablishmentAction(id, data);

      await fetchEstablishments();
      addToast({
        title: "Éxito",
        description: "Establecimiento actualizado correctamente",
        color: "success",
      });

      return res;
    } catch (err: any) {
      const msg = err.message || "Error al actualizar establecimiento";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
      throw err;
    }
  };

  const deleteEstablishment = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteEstablishmentAction(id);
      await fetchEstablishments();
      addToast({
        title: "Eliminado",
        description: "Establecimiento eliminado permanentemente",
        color: "warning",
      });
    } catch (err: any) {
      const msg = err.message || "Error al eliminar establecimiento";

      addToast({ title: "Error", description: msg, color: "danger" });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEstablishments();
  }, [fetchEstablishments]);

  return {
    establishments,
    isLoading,
    error,
    refresh: fetchEstablishments,
    addEstablishment,
    editEstablishment,
    deleteEstablishment,
  };
};
