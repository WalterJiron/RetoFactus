"use client";

import { useState, useCallback, useEffect } from "react";
import { PaymentForm } from "../_types/payment-forms.types";
import { getPaymentFormsAction } from "../_services/payment-forms.actions";

export const usePaymentForms = () => {
  const [paymentForms, setPaymentForms] = useState<PaymentForm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentForms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPaymentFormsAction();
      setPaymentForms(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch payment forms");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentForms();
  }, [fetchPaymentForms]);

  return {
    paymentForms,
    isLoading,
    error,
    refresh: fetchPaymentForms,
  };
};
