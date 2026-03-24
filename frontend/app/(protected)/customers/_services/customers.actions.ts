// app/(protected)/customers/_services/customers.actions.ts
"use server";

import { fetchServer } from "@/libs/fetchServer";

import { Customer, CustomerDTO } from "../_types/customers.types";

const API_URL = `${process.env.API_URL}/customers`;

export const getCustomersAction = async (): Promise<Customer[]> => {
  return await fetchServer<Customer[]>(API_URL, {
    method: "GET",
  });
};

export const createCustomerAction = async (
  data: CustomerDTO,
): Promise<Customer> => {
  return await fetchServer<Customer>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCustomerAction = async (
  id: string,
  data: CustomerDTO,
): Promise<Customer> => {
  return await fetchServer<Customer>(`${API_URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteCustomerAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};

export const activateCustomerAction = async (id: string): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/activate/${id}`, {
    method: "PUT",
  });
};
