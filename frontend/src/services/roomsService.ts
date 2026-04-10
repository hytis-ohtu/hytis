import axios from "axios";
import { BASE_URL } from "../constants";
import type { Room } from "../types";

export async function findAllRooms(): Promise<Room[]> {
  const response = await axios.get<Room[]>(`${BASE_URL}/api/rooms`);

  return response.data;
}

export async function findRoomById(id: string): Promise<Room> {
  const response = await axios.get<Promise<Room>>(
    `${BASE_URL}/api/rooms/${id}`,
  );

  return await response.data;
}

export async function editRoom(
  id: number,
  values: Record<string, string>,
): Promise<void> {
  const { department, capacity, ...rest } = values;

  const body = {
    ...rest,
    ...(capacity !== undefined && {
      capacity: capacity === "" ? null : Number(capacity),
    }),
    ...(department !== undefined && {
      departmentId: department === "" ? null : Number(department),
    }),
  };

  await axios.put(`${BASE_URL}/api/rooms/${id}`, body);
}
