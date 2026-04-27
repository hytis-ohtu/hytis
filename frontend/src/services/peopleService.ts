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

const buildPersonPayload = (
  values: Record<string, string | undefined>,
  roomId: string | number,
) => ({
  firstName: values.firstName,
  lastName: values.lastName,
  departmentId: values.department ? Number(values.department) : null,
  titleId: values.jobtitle ? Number(values.jobtitle) : null,
  supervisorIds: values.supervisors
    ? values.supervisors.split(",").map(Number)
    : [],
  researchGroupId: values.researchgroup ? Number(values.researchgroup) : null,
  freeText: values.misc || null,
  startDate: values.startDate || null,
  endDate: values.endDate || null,
  roomId: roomId,
});

export async function addPerson(
  values: Record<string, string | undefined>,
  roomId: number,
): Promise<Person> {
  const response = await axios.post<Person>(
    `${BASE_URL}/api/people`,
    buildPersonPayload(values, roomId),
  );
  return response.data;
}

export async function editPerson(
  id: number,
  values: Record<string, string>,
  roomId: number,
): Promise<Person> {
  const response = await axios.put<Person>(
    `${BASE_URL}/api/people/${id}`,
    buildPersonPayload(values, roomId),
  );
  return response.data;
}
