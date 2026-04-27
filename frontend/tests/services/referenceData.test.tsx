import {
  findAllDepartments,
  findAllResearchGroups,
  findAllRoomTypes,
  findAllTitles,
  type ReferenceItem,
} from "@services/referenceDataService";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

vi.mock("@constants", () => ({ BASE_URL: "" }));

const mockedAxios = vi.mocked(axios);

const mockDepartments: ReferenceItem[] = [
  { id: 1, name: "CS" },
  { id: 2, name: "Math" },
];

const mockTitles: ReferenceItem[] = [
  { id: 1, name: "Tutkija" },
  { id: 2, name: "Lehtori" },
];

const mockResearchGroups: ReferenceItem[] = [
  { id: 1, name: "Tutkimusryhmä 1" },
  { id: 2, name: "Tutkimusryhmä 2" },
];

describe("referenceDataService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAllDepartments", () => {
    it("returns departments from the API", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: mockDepartments });

      const result = await findAllDepartments();

      expect(result).toEqual(mockDepartments);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/reference-data/departments",
      );
    });

    it("calls the correct endpoint", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await findAllDepartments();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/reference-data/departments"),
      );
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Network error");
      mockedAxios.get = vi.fn().mockRejectedValue(error);

      await expect(findAllDepartments()).rejects.toThrow("Network error");
    });

    it("returns an empty array when the API returns no data", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      const result = await findAllDepartments();

      expect(result).toEqual([]);
    });
  });

  describe("findAllTitles", () => {
    it("returns titles from the API", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: mockTitles });

      const result = await findAllTitles();

      expect(result).toEqual(mockTitles);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/reference-data/titles",
      );
    });

    it("calls the correct endpoint", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await findAllTitles();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/reference-data/titles"),
      );
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Server error");
      mockedAxios.get = vi.fn().mockRejectedValue(error);

      await expect(findAllTitles()).rejects.toThrow("Server error");
    });

    it("returns an empty array when the API returns no data", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      const result = await findAllTitles();

      expect(result).toEqual([]);
    });
  });

  describe("findAllResearchGroups", () => {
    it("returns research groups from the API", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: mockResearchGroups });

      const result = await findAllResearchGroups();

      expect(result).toEqual(mockResearchGroups);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/reference-data/research-groups",
      );
    });

    it("calls the correct endpoint", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      await findAllResearchGroups();

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/reference-data/research-groups"),
      );
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Timeout");
      mockedAxios.get = vi.fn().mockRejectedValue(error);

      await expect(findAllResearchGroups()).rejects.toThrow("Timeout");
    });

    it("returns an empty array when the API returns no data", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [] });

      const result = await findAllResearchGroups();

      expect(result).toEqual([]);
    });
  });

  describe("findAllRoomTypes", () => {
    it("returns room types from the API", async () => {
      mockedAxios.get = vi
        .fn()
        .mockResolvedValue({ data: [{ id: 1, name: "Konferenssihuone" }] });

      const result = await findAllRoomTypes();

      expect(result).toEqual([{ id: 1, name: "Konferenssihuone" }]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "/api/reference-data/room-types",
      );
    });
  });
});
