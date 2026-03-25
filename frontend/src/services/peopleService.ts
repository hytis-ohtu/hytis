import axios from "axios";
import { BASE_URL } from "../constants";
import type { Person } from "../types";

export async function searchPeople(query: string): Promise<Person[]> {
  const response = await axios.get<Person[]>(
    `${BASE_URL}/api/people?q=${encodeURIComponent(query)}`,
  );

  return response.data;
}

export async function addPerson(
  values: Record<string, string>,
  roomId: string | number,
): Promise<Person> {
  const response = await axios.post<Person>(`${BASE_URL}/api/people`, {
    firstName: values.firstName,
    lastName: values.lastName,
    departmentId: values.department || undefined,
    titleId: values.jobtitle || undefined,
    supervisorIds: values.supervisors || undefined,
    researchGroupId: values.researchgroup || undefined,
    freeText: values.misc,
    startDate: values.startDate,
    endDate: values.endDate,
    roomId,
  });

  return response.data;
}
