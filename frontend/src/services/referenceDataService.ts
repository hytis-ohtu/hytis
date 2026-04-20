import axios from "axios";
import { BASE_URL } from "../constants";

export interface ReferenceItem {
  id: number;
  name: string;
}

export async function findAllDepartments(): Promise<ReferenceItem[]> {
  const response = await axios.get<ReferenceItem[]>(
    `${BASE_URL}/api/reference-data/departments`,
  );
  return response.data;
}

export async function findAllTitles(): Promise<ReferenceItem[]> {
  const response = await axios.get<ReferenceItem[]>(
    `${BASE_URL}/api/reference-data/titles`,
  );
  return response.data;
}

export async function findAllResearchGroups(): Promise<ReferenceItem[]> {
  const response = await axios.get<ReferenceItem[]>(
    `${BASE_URL}/api/reference-data/research-groups`,
  );
  return response.data;
}

export async function findAllRoomTypes(): Promise<ReferenceItem[]> {
  const response = await axios.get<ReferenceItem[]>(
    `${BASE_URL}/api/reference-data/room-types`,
  );
  return response.data;
}
