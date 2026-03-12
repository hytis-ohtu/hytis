import { BASE_URL } from "../constants";
import type { UserData } from "../types/auth";

const API_BASE_URL = BASE_URL || "http://localhost:3000";

export async function getCurrentUser(): Promise<UserData> {
  const response = await fetch(`${API_BASE_URL}/api/user`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Not authenticated");
  }
  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
  const data = await response.json();
  if (data.logoutUrl) {
    window.location.href = data.logoutUrl;
  }
}

export function login(): void {
  window.location.href = `${API_BASE_URL}/api/login`;
}
