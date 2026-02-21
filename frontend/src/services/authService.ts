import { BASE_URL } from "../constants";
import type { UserData } from "../types/auth";

const API_BASE_URL =
  BASE_URL ||
  "https://hytis-ohtuprojekti-staging.ext.ocp-test-0.k8s.it.helsinki.fi";

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
  await fetch(`${API_BASE_URL}/api/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export function login(): void {
  window.location.href = `${API_BASE_URL}/api/login`;
}
