import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { BASE_URL } from "../../src/constants";
import {
  editRoom,
  findAllRooms,
  findRoomById,
} from "../../src/services/roomsService";

vi.mock("axios");

const mockedAxios = vi.mocked(axios);

describe("roomsService", () => {
  it("findAllRooms returns data", async () => {
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: [] });
    expect(await findAllRooms()).toEqual([]);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/api/rooms`);
  });

  it("findRoomById returns data", async () => {
    const room = { id: 1 };
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: room });
    expect(await findRoomById(1)).toEqual(room);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`);
  });

  it("findRoomById collapses rapid requests into the latest one", async () => {
    vi.useFakeTimers();

    const latestRoom = { id: 2 };
    mockedAxios.get = vi.fn().mockResolvedValueOnce({ data: latestRoom });

    const firstRequest = findRoomById(1);
    const secondRequest = findRoomById(2);

    await vi.runAllTimersAsync();

    await expect(firstRequest).rejects.toMatchObject({ message: "" });
    await expect(secondRequest).resolves.toEqual(latestRoom);

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/2`);

    vi.useRealTimers();
  });

  it("editRoom sends transformed body with numeric capacity and departmentId", async () => {
    mockedAxios.put = vi.fn().mockResolvedValueOnce({});
    await editRoom(1, {
      capacity: "10",
      department: "3",
      roomType: "1",
    });
    expect(mockedAxios.put).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`, {
      roomTypeId: 1,
      capacity: 10,
      departmentId: 3,
    });
  });

  it("editRoom sends null for empty capacity and department", async () => {
    mockedAxios.put = vi.fn().mockResolvedValueOnce({});
    await editRoom(1, { capacity: "", department: "" });
    expect(mockedAxios.put).toHaveBeenCalledWith(`${BASE_URL}/api/rooms/1`, {
      capacity: null,
      departmentId: null,
    });
  });
});
