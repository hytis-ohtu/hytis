import axios from "axios";
import { BASE_URL } from "../constants";

export async function createContract(
  personId: number,
  roomId: number,
  startDate?: string | null,
  endDate?: string | null,
): Promise<void> {
  await axios.post(`${BASE_URL}/api/contracts`, {
    personId: Number(personId),
    roomId: Number(roomId),
    startDate: startDate || null,
    endDate: endDate || null,
  });
}

export async function removeContract(contractId: number): Promise<void> {
  await axios.delete(`${BASE_URL}/api/contracts/${contractId}`);
}
