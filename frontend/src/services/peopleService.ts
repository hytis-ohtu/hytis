import axios from "axios";
import { BASE_URL } from "../constants";
import type { Person } from "../types";

export async function searchPeople(query: string): Promise<Person[]> {
  const response = await axios.get<Person[]>(
    `${BASE_URL}/api/people?q=${encodeURIComponent(query)}`,
  );

  return response.data;
}
