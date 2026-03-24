"use server";

import { fetchServer } from "@/libs/fetchServer";

import { SubCategory, SubCategoryDTO } from "../_types/sub-category.types";

const API_URL = `${process.env.API_URL}/sub-category`;

export const getSubCategoriesAction = async (): Promise<SubCategory[]> => {
  return await fetchServer<SubCategory[]>(API_URL, {
    method: "GET",
  });
};

export const createSubCategoryAction = async (
  data: SubCategoryDTO,
): Promise<SubCategory> => {
  return await fetchServer<SubCategory>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSubCategoryAction = async (
  id: number,
  data: SubCategoryDTO,
): Promise<SubCategory> => {
  return await fetchServer<SubCategory>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteSubCategoryAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateSubCategoryAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
