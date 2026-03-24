"use server";

import { fetchServer } from "@/libs/fetchServer";

import { Product, ProductDTO } from "../_types/products.types";

const API_URL = `${process.env.API_URL}/products`;

export const getProductsAction = async (): Promise<Product[]> => {
  return await fetchServer<Product[]>(API_URL, {
    method: "GET",
  });
};

export const createProductAction = async (
  data: ProductDTO,
): Promise<Product> => {
  return await fetchServer<Product>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateProductAction = async (
  id: string,
  data: ProductDTO,
): Promise<Product> => {
  return await fetchServer<Product>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteProductAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateProductAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
