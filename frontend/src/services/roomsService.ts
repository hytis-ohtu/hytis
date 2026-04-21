import axios from "axios";
import { BASE_URL } from "../constants";
import type { Room } from "../types";

const ROOM_FETCH_DELAY_MS = import.meta.env.DEV ? 2000 : 0;
let latestReqId = 0;
let delayTimer: ReturnType<typeof setTimeout> | null = null;
let cancelLatestReq: (() => void) | null = null;

export async function findAllRooms(): Promise<Room[]> {
  const response = await axios.get<Room[]>(`${BASE_URL}/api/rooms`);

  return response.data;
}

export async function findRoomById(id: number): Promise<Room> {
  const reqId = ++latestReqId;

  if (delayTimer !== null) {
    clearTimeout(delayTimer);
    delayTimer = null;
  }

  if (cancelLatestReq !== null) {
    cancelLatestReq();
    cancelLatestReq = null;
  }

  return new Promise<Room>((resolve, reject) => {
    cancelLatestReq = () => reject(new Error());

    delayTimer = setTimeout(async () => {
      delayTimer = null;

      try {
        const response = await axios.get<Room>(`${BASE_URL}/api/rooms/${id}`);

        if (reqId !== latestReqId) {
          reject(new Error());
          return;
        }

        cancelLatestReq = null;
        resolve(response.data);
      } catch (error) {
        if (reqId === latestReqId) {
          cancelLatestReq = null;
        }
        reject(error instanceof Error ? error : new Error());
      }
    }, ROOM_FETCH_DELAY_MS);
  });
}

export async function editRoom(
  id: number,
  values: Record<string, string>,
): Promise<void> {
  const { department, capacity, roomType, freeText, ...rest } = values;

  const body = {
    ...rest,
    ...(capacity !== undefined && {
      capacity: capacity === "" ? null : Number(capacity),
    }),
    ...(department !== undefined && {
      departmentId: department === "" ? null : Number(department),
    }),
    ...(freeText !== undefined && {
      freeText: freeText === "" ? null : freeText,
    }),
    ...(roomType !== undefined && {
      roomTypeId: roomType === "" ? null : Number(roomType),
    }),
  };

  await axios.put(`${BASE_URL}/api/rooms/${id}`, body);
}
