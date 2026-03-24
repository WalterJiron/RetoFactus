// app/(protected)/roles/_hooks/useRoles.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { Role, RoleDTO } from "../_types/roles.types";
import {
  getRolesAction,
  createRoleAction,
  updateRoleAction,
  deleteRoleAction,
  activateRoleAction,
} from "../_services/roles.actions";

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRolesAction();

      setRoles(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addRole = async (data: RoleDTO) => {
    setIsLoading(true);
    try {
      const res = await createRoleAction(data);

      await fetchRoles(); // Refresh after add

      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to create role";

      setError(msg);
      setIsLoading(false);
      throw new Error(msg);
    }
  };

  const editRole = async (id: number, data: RoleDTO) => {
    setIsLoading(true);
    try {
      const res = await updateRoleAction(id, data);

      await fetchRoles(); // Refresh after update

      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to update role";

      setError(msg);
      setIsLoading(false);
      throw new Error(msg);
    }
  };

  const removeRole = async (id: number) => {
    setIsLoading(true);
    try {
      await deleteRoleAction(id);
      await fetchRoles(); // Refresh after delete
    } catch (err: any) {
      setError(err.message || "Failed to delete role");
      setIsLoading(false);
    }
  };

  const toggleRoleStatus = async (id: number, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteRoleAction(id);
        addToast({
          title: "Rol Desactivado",
          description: "Los usuarios con este rol perderán ciertos permisos.",
          color: "warning",
        });
      } else {
        await activateRoleAction(id);
        addToast({
          title: "Rol Activado",
          description: "El rol está ahora disponible para asignación.",
          color: "success",
        });
      }
      await fetchRoles();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado del rol";

      setError(msg);
      addToast({
        title: "Error de Operación",
        description: msg,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  return {
    roles,
    isLoading,
    error,
    refresh: fetchRoles,
    addRole,
    editRole,
    removeRole,
    toggleRoleStatus,
  };
};
