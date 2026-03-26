import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { addPerson } from "../src/services/peopleService";
import type { Person } from "../src/types";

vi.mock("axios");
vi.mock("../constants", () => ({ BASE_URL: "" }));

const mockedAxios = vi.mocked(axios);

const mockPerson: Person = {
  id: 1,
  firstName: "Terppa",
  lastName: "Testaaja",
  department: { id: 2, name: "CS" },
  title: { name: "Devaaja" },
};

describe("peopleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addPerson", () => {
    it("posts the correct payload and returns the created person", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        department: "2",
        jobtitle: "3",
        supervisors: "5,6",
        researchgroup: "1",
        misc: "Some notes",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
      };

      const result = await addPerson(values, 10);

      expect(result).toEqual(mockPerson);
      expect(mockedAxios.post).toHaveBeenCalledWith("/api/people", {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: "2",
        titleId: "3",
        supervisorIds: [5, 6],
        researchGroupId: "1",
        freeText: "Some notes",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
        roomId: 10,
      });
    });

    it("sends undefined for optional fields when they are missing", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "2024-01-01",
        endDate: "",
      };

      await addPerson(values, "room-42");

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/people", {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: undefined,
        titleId: undefined,
        supervisorIds: undefined,
        researchGroupId: undefined,
        freeText: "",
        startDate: "2024-01-01",
        endDate: "",
        roomId: "room-42",
      });
    });

    it("accepts a string roomId", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await addPerson(values, "room-99");

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ roomId: "room-99" }),
      );
    });

    it("accepts a numeric roomId", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await addPerson(values, 7);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ roomId: 7 }),
      );
    });

    it("posts to the correct endpoint", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await addPerson(values, 1);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        "/api/people",
        expect.any(Object),
      );
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Bad request");
      mockedAxios.post = vi.fn().mockRejectedValue(error);

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await expect(addPerson(values, 1)).rejects.toThrow("Bad request");
    });

    it("maps empty optional strings to undefined", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        department: "",
        jobtitle: "",
        supervisors: "",
        researchgroup: "",
        misc: "",
        startDate: "2024-01-01",
        endDate: "",
      };

      await addPerson(values, 1);

      expect(mockedAxios.post).toHaveBeenCalledWith(expect.any(String), {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: undefined,
        titleId: undefined,
        supervisorIds: undefined,
        researchGroupId: undefined,
        freeText: "",
        startDate: "2024-01-01",
        endDate: "",
        roomId: 1,
      });
    });
  });
});
