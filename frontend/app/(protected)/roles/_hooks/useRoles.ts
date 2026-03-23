// app/(protected)/roles/_hooks/useRoles.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { Role, RoleDTO } from "../_types/roles.types";
import { 
  getRolesAction, 
  createRoleAction, 
  updateRoleAction, 
  deleteRoleAction, 
  activateRoleAction 
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
      await createRoleAction(data);
      await fetchRoles(); // Refresh after add
    } catch (err: any) {
      setError(err.message || "Failed to create role");
      setIsLoading(false);
      throw err;
    }
  };

  const editRole = async (id: number, data: RoleDTO) => {
    setIsLoading(true);
    try {
      await updateRoleAction(id, data);
      await fetchRoles(); // Refresh after update
    } catch (err: any) {
      setError(err.message || "Failed to update role");
      setIsLoading(false);
      throw err;
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
    setIsLoading(true);
    try {
      if (currentStatus) {
        await deleteRoleAction(id);
      } else {
        await activateRoleAction(id);
      }
      await fetchRoles();
    } catch (err: any) {
      setError(err.message || "Failed to toggle role status");
      setIsLoading(false);
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
