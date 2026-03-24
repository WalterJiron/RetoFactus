// app/(protected)/users/_services/users.actions.ts
"use server";

import { fetchServer } from "@/libs/fetchServer";

import { User, UserDTO } from "../_types/users.types";

const API_URL = `${process.env.API_URL}/users`;

export const getUsersAction = async (): Promise<User[]> => {
  return await fetchServer<User[]>(API_URL, {
    method: "GET",
  });
};

export const createUserAction = async (data: UserDTO): Promise<User> => {
  return await fetchServer<User>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateUserAction = async (
  id: string,
  data: UserDTO,
): Promise<User> => {
  return await fetchServer<User>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteUserAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateUserAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
