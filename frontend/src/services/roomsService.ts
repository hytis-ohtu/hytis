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
