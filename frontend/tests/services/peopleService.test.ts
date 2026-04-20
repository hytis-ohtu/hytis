import "@testing-library/jest-dom";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addPerson,
  editPerson,
  findAllPeople,
  searchPeople,
} from "../../src/services/peopleService";
import type { Person } from "../../src/types";

vi.mock("axios");

vi.mock("../src/constants", () => ({ BASE_URL: "" }));

const mockedAxios = vi.mocked(axios);

const mockPerson: Person = {
  id: 1,
  firstName: "Terppa",
  lastName: "Testaaja",
  freeText: null,
  department: { id: 2, name: "CS" },
  title: { id: 1, name: "Devaaja" },
  researchGroup: { id: 1, name: "Test Research Group" },
};

describe("peopleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("findAllPeople", () => {
    it("fetches from the correct endpoint and returns the data", async () => {
      mockedAxios.get = vi.fn().mockResolvedValue({ data: [mockPerson] });

      const result = await findAllPeople();

      expect(result).toEqual([mockPerson]);
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/people");
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Network error");
      mockedAxios.get = vi.fn().mockRejectedValue(error);

      await expect(findAllPeople()).rejects.toThrow("Network error");
    });
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
        endDate: undefined,
      };

      await addPerson(values, "room-42");

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/people", {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: undefined,
        titleId: undefined,
        supervisorIds: undefined,
        researchGroupId: undefined,
        freeText: undefined,
        startDate: "2024-01-01",
        endDate: undefined,
        roomId: "room-42",
      });
    });

    it("accepts a string roomId", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: undefined,
        endDate: undefined,
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
        freeText: undefined,
        startDate: "2024-01-01",
        endDate: undefined,
        roomId: 1,
      });
    });
  });

  describe("editPerson", () => {
    it("puts the correct payload and returns the updated person", async () => {
      mockedAxios.put = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        department: "2",
        jobtitle: "3",
        supervisors: "5,6",
        researchgroup: "1",
        misc: "Updated notes",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
      };

      const result = await editPerson(42, values, "10");

      expect(result).toEqual(mockPerson);
      expect(mockedAxios.put).toHaveBeenCalledWith("/api/people/42", {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: 2,
        titleId: 3,
        supervisorIds: [5, 6],
        researchGroupId: 1,
        freeText: "Updated notes",
        startDate: "2024-01-01",
        endDate: "2025-01-01",
        roomId: 10,
      });
    });

    it("maps empty edit fields to null or undefined as expected", async () => {
      mockedAxios.put = vi.fn().mockResolvedValue({ data: mockPerson });

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await editPerson(7, values, 3);

      expect(mockedAxios.put).toHaveBeenCalledWith("/api/people/7", {
        firstName: "Jane",
        lastName: "Doe",
        departmentId: undefined,
        titleId: undefined,
        supervisorIds: [],
        researchGroupId: undefined,
        freeText: undefined,
        startDate: null,
        endDate: null,
        roomId: 3,
      });
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Bad request");
      mockedAxios.put = vi.fn().mockRejectedValue(error);

      const values = {
        firstName: "Jane",
        lastName: "Doe",
        misc: "",
        startDate: "",
        endDate: "",
      };

      await expect(editPerson(1, values, 1)).rejects.toThrow("Bad request");
    });
  });

  describe("searchPeople", () => {
    it("calls the correct API endpoint with query parameter", async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            firstName: "Matti",
            lastName: "Virtanen",
            department: { id: 1, name: "H516 MATHSTAT" },
            title: { name: "asiantuntija" },
          },
        ],
      };

      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await searchPeople("Matti");

      expect(axios.get).toHaveBeenCalledWith("/api/people", {
        params: {
          q: "Matti",
          type: "personName",
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("encodes query parameters correctly", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await searchPeople("Matti Meikäläinen");

      expect(axios.get).toHaveBeenCalledWith("/api/people", {
        params: {
          q: "Matti Meikäläinen",
          type: "personName",
        },
      });
    });

    it("handles special characters in search query", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await searchPeople("Ölä Åå");

      expect(axios.get).toHaveBeenCalledWith("/api/people", {
        params: {
          q: "Ölä Åå",
          type: "personName",
        },
      });
    });

    it("returns empty array when no results found", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      const result = await searchPeople("Nonexistent");

      expect(result).toEqual([]);
    });

    it("throws error when API call fails", async () => {
      const mockError = new Error("Network error");
      vi.mocked(axios.get).mockRejectedValue(mockError);

      await expect(searchPeople("Matti")).rejects.toThrow("Network error");
    });

    it("includes the base URL from constants", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await searchPeople("test");

      expect(axios.get).toHaveBeenCalledWith("/api/people", {
        params: {
          q: "test",
          type: "personName",
        },
      });
    });
  });
});
