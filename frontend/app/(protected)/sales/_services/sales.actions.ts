"use server";

import { fetchServer } from "@/libs/fetchServer";
import { CreateSaleDTO, Sale, SaleStatus, UpdateSaleDTO } from "../_types/sales.types";

const API_URL = `${process.env.API_URL}/sales`;

export const getSalesAction = async (): Promise<Sale[]> => {
  return await fetchServer<Sale[]>(API_URL, {
    method: "GET",
  });
};

export const createSaleAction = async (data: CreateSaleDTO): Promise<Sale> => {
  return await fetchServer<Sale>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateSaleAction = async (id: number, data: UpdateSaleDTO): Promise<Sale> => {
  return await fetchServer<Sale>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const updateSaleStatusAction = async (id: number, status: SaleStatus): Promise<Sale> => {
  return await fetchServer<Sale>(`${API_URL}/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const deleteSaleAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateSaleAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
