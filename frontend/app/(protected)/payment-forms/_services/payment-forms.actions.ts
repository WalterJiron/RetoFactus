"use server";

import { fetchServer } from "@/libs/fetchServer";
import { PaymentForm } from "../_types/payment-forms.types";

const API_URL = `${process.env.API_URL}/payment-forms`;

export const getPaymentFormsAction = async (): Promise<PaymentForm[]> => {
  return await fetchServer<PaymentForm[]>(API_URL, {
    method: "GET",
  });
};
