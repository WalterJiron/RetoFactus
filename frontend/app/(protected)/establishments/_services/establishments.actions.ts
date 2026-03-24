"use server";

import { fetchServer } from "@/libs/fetchServer";

import {
  Establishment,
  EstablishmentDTO,
} from "../_types/establishments.types";

const API_URL = `${process.env.API_URL}/establishments`;

export const getEstablishmentsAction = async (): Promise<Establishment[]> => {
  return await fetchServer<Establishment[]>(`${API_URL}/id`, {
    method: "GET",
  });
};

export const createEstablishmentAction = async (
  data: EstablishmentDTO,
): Promise<Establishment> => {
  return await fetchServer<Establishment>(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateEstablishmentAction = async (
  data: EstablishmentDTO,
): Promise<Establishment> => {
  return await fetchServer<Establishment>(`${API_URL}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteEstablishmentAction = async (id: number): Promise<void> => {
  return await fetchServer<void>(`${API_URL}/${id}`, {
    method: "DELETE",
  });
};
