"use client";

import React, {
  createContext,
  useContext,
  useTransition,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface LoadingContextType {
  isNavigating: boolean;
  navigate: (path: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const navigate = useCallback(
    (path: string) => {
      startTransition(() => {
        router.push(path);
      });
    },
    [router],
  );

  return (
    <LoadingContext.Provider value={{ isNavigating: isPending, navigate }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  return context;
}
