"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const fetchServer = async <T = any>(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<T> => {
  const cookieStore = await cookies();
  let authToken = cookieStore.get("authToken")?.value;

  if (!authToken) {
    const session = await getServerSession(authOptions);

    authToken = session?.accessToken;
  }

  if (!authToken) {
    redirect("/");
  }

  const response = await fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      "Content-Type": "application/json",
      ...(authToken && { Authorization: `Bearer ${authToken}` }),
    },
  });

  if (response.status === 401) {
    redirect("/");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  const responseData = await response.json().catch(() => ({}));

  return responseData;
};