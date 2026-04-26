import { BASE_URL } from "@constants";
import type { UserData } from "@types";
import axios from "axios";

export async function getCurrentUser(): Promise<UserData> {
  const response = await axios.get<UserData>(`${BASE_URL}/api/user`, {
    withCredentials: true,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  const response = await axios.post<{ logoutUrl?: string }>(
    `${BASE_URL}/api/logout`,
    undefined,
    { withCredentials: true },
  );
  const data = response.data;
  if (data.logoutUrl) {
    window.location.href = data.logoutUrl;
  }
}

export function login(): void {
  window.location.href = `${BASE_URL}/api/login`;
}
