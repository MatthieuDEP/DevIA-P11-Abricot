import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, apiRequest } from "./api";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "./auth-constants";

export async function createSession(token) {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
    priority: "high",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export const getCurrentUser = cache(async () => {
  const token = await getSessionToken();

  if (!token) {
    return null;
  }

  try {
    const response = await apiRequest("/auth/profile", { token });
    return response?.data?.user || null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/api/auth/logout?reason=session-expired");
  }

  return user;
}
