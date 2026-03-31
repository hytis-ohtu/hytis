import axios from "axios";
import { BASE_URL } from "../constants";
import type { Person } from "../types";

export async function findAllPeople(): Promise<Person[]> {
  const response = await axios.get<Person[]>(`${BASE_URL}/api/people`);
  return response.data;
}

export async function searchPeople(query: string): Promise<Person[]> {
  const response = await axios.get<Person[]>(
    `${BASE_URL}/api/people?q=${encodeURIComponent(query)}`,
  );

  return response.data;
}

export async function addPerson(
  values: Record<string, string | undefined>,
  roomId: string | number,
): Promise<Person> {
  const supervisorIds = values.supervisors
    ? values.supervisors.split(",").map(Number)
    : undefined;

  const response = await axios.post<Person>(`${BASE_URL}/api/people`, {
    firstName: values.firstName,
    lastName: values.lastName,
    departmentId: values.department || undefined,
    titleId: values.jobtitle || undefined,
    supervisorIds: supervisorIds?.length ? supervisorIds : undefined,
    researchGroupId: values.researchgroup || undefined,
    freeText: values.misc || undefined,
    startDate: values.startDate || undefined,
    endDate: values.endDate || undefined,
    roomId,
  });

  return response.data;
}
