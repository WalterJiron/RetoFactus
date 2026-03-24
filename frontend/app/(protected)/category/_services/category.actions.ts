"use server";

import { fetchServer } from "@/libs/fetchServer";

import { Category, CategoryDTO } from "../_types/category.types";

const API_URL = `${process.env.API_URL}/categorys`;

export const getCategoriesAction = async (): Promise<Category[]> => {
  return await fetchServer<Category[]>(API_URL, {
    method: "GET",
  });
};

export const createCategoryAction = async (
  data: CategoryDTO,
): Promise<Category> => {
  return await fetchServer<Category>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCategoryAction = async (
  id: number,
  data: CategoryDTO,
): Promise<Category> => {
  return await fetchServer<Category>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteCategoryAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateCategoryAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
