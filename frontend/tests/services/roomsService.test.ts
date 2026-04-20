import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { BASE_URL } from "../../src/constants";
import {
  editRoom,
  findAllRooms,
  findRoomById,
} from "../../src/services/roomsService";

vi.mock("axios");

describe("roomsService", () => {
  it("findAllRooms returns data", async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });
    expect(await findAllRooms()).toEqual([]);
    expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/rooms`);
  });

  it("findRoomById returns data", async () => {
    const room = { id: 1 };
    vi.mocked(axios.get).mockResolvedValueOnce({ data: room });
    expect(await findRoomById("1")).toEqual(room);
    expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`);
  });

  it("editRoom sends transformed body with numeric capacity and departmentId", async () => {
    vi.mocked(axios.put).mockResolvedValueOnce({});
    await editRoom(1, {
      capacity: "10",
      department: "3",
      roomType: "1",
    });
    expect(axios.put).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`, {
      roomTypeId: 1,
      capacity: 10,
      departmentId: 3,
    });
  });

  it("editRoom sends null for empty capacity and department", async () => {
    vi.mocked(axios.put).mockResolvedValueOnce({});
    await editRoom(1, { capacity: "", department: "" });
    expect(axios.put).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`, {
      capacity: null,
      departmentId: null,
    });
  });
});
