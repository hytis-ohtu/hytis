import axios from "axios";
import { BASE_URL } from "../constants";
import type { UserData } from "../types";

export async function getCurrentUser(): Promise<UserData> {
  const response = await axios.get<Promise<UserData>>(`${BASE_URL}/api/user`, {
    withCredentials: true,
  });

  if (response.statusText != "OK") {
    throw new Error("Not authenticated");
  }
  return response.data;
}

export async function logout(): Promise<void> {
  const response = await axios.post(`${BASE_URL}/api/logout`, {
    withCredentials: true,
  });
  const data = await response.data;
  if (data.logoutUrl) {
    window.location.href = data.logoutUrl;
  }
}

export function login(): void {
  window.location.href = `${BASE_URL}/api/login`;
}
