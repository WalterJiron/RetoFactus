// app/(protected)/roles/_services/roles.actions.ts
"use server";

import { fetchServer } from "@/libs/fetchServer";

import { Role, RoleDTO } from "../_types/roles.types";

const API_URL = `${process.env.API_URL}/roles`;

export const getRolesAction = async (): Promise<Role[]> => {
  return await fetchServer<Role[]>(API_URL, {
    method: "GET",
  });
};

export const createRoleAction = async (data: RoleDTO): Promise<Role> => {
  return await fetchServer<Role>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateRoleAction = async (
  id: number,
  data: RoleDTO,
): Promise<Role> => {
  return await fetchServer<Role>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteRoleAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateRoleAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
