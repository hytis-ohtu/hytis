import "@testing-library/jest-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { searchPeople } from "../src/services/peopleService";
import axios from "axios";

// Mock axios
vi.mock("axios");

describe("peopleService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("/api/people?q=Matti"),
      );
      expect(result).toEqual(mockResponse.data);
    });

    it("encodes query parameters correctly", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await searchPeople("Matti Meikäläinen");

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("q=Matti%20Meik%C3%A4l%C3%A4inen"),
      );
    });

    it("handles special characters in search query", async () => {
      const mockResponse = { data: [] };
      vi.mocked(axios.get).mockResolvedValue(mockResponse);

      await searchPeople("Ölä Åå");

      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("q=%C3%96l%C3%A4%20%C3%85%C3%A5"),
      );
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

      const callArgs = vi.mocked(axios.get).mock.calls[0][0];
      expect(callArgs).toContain("/api/people");
      expect(callArgs).toContain("q=test");
    });
  });
});
