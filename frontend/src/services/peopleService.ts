import { BASE_URL } from "@constants";
import type { Person } from "@types";
import axios from "axios";

export async function findAllPeople(): Promise<Person[]> {
  const response = await axios.get<Person[]>(`${BASE_URL}/api/people`);
  return response.data;
}

export type SearchType = "name" | "supervisor" | "endDate";

const SEARCH_PARAM: Record<SearchType, string> = {
  name: "personName",
  supervisor: "supervisorName",
  endDate: "contractEndDate",
};

export async function searchPeople(
  query: string,
  type: SearchType = "name",
): Promise<Person[]> {
  const param = SEARCH_PARAM[type];

  const response = await axios.get<Person[]>(`${BASE_URL}/api/people`, {
    params: {
      q: query,
      type: param,
    },
  });

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

export async function editPerson(
  id: number,
  values: Record<string, string>,
  roomId: string | number,
): Promise<Person> {
  const supervisorIds = values.supervisors
    ? values.supervisors.split(",").map(Number)
    : [];

  const response = await axios.put<Person>(`${BASE_URL}/api/people/${id}`, {
    firstName: values.firstName,
    lastName: values.lastName,
    departmentId: values.department ? Number(values.department) : undefined,
    titleId: values.jobtitle ? Number(values.jobtitle) : undefined,
    supervisorIds: supervisorIds,
    researchGroupId: values.researchgroup
      ? Number(values.researchgroup)
      : undefined,
    freeText: values.misc || undefined,
    startDate: values.startDate || null,
    endDate: values.endDate || null,
    roomId: Number(roomId),
  });

  return response.data;
}
