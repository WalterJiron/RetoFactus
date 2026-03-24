// app/(protected)/users/_hooks/useUsers.ts
"use client";

import { useState, useCallback, useEffect } from "react";
import { addToast } from "@heroui/toast";

import { User, UserDTO } from "../_types/users.types";
import {
  getUsersAction,
  createUserAction,
  updateUserAction,
  deleteUserAction,
  activateUserAction,
} from "../_services/users.actions";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsersAction();

      setUsers(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addUser = async (data: UserDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await createUserAction(data);

      await fetchUsers(); // Refresh after add

      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to create user";

      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const editUser = async (id: string, data: UserDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await updateUserAction(id, data);

      await fetchUsers(); // Refresh after update

      return res;
    } catch (err: any) {
      const msg = err.message || "Failed to update user";

      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (id: string) => {
    try {
      await deleteUserAction(id);
      await fetchUsers(); // Refresh after delete
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await deleteUserAction(id);
        addToast({
          title: "Usuario Desactivado",
          description: "El acceso del usuario ha sido revocado.",
          color: "warning",
        });
      } else {
        await activateUserAction(id);
        addToast({
          title: "Usuario Activado",
          description: "El acceso del usuario ha sido restaurado.",
          color: "success",
        });
      }
      await fetchUsers();
    } catch (err: any) {
      const msg = err.message || "Error al cambiar estado del usuario";

      setError(msg);
      addToast({
        title: "Error de Operación",
        description: msg,
        color: "danger",
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    refresh: fetchUsers,
    addUser,
    editUser,
    removeUser,
    toggleUserStatus,
  };
};
