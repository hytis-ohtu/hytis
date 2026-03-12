import { BASE_URL } from "../constants";
import type { UserData } from "../types/auth";

export async function getCurrentUser(): Promise<UserData> {
  const response = await fetch(`${BASE_URL}/api/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

export async function logout(): Promise<void> {
  await fetch(`${BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export function login(): void {
  window.location.href = `${BASE_URL}/api/login`;
}
