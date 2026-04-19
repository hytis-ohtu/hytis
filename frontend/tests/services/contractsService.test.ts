import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createContract } from "../../src/services/contractsService";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
    create: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

vi.mock("../src/constants", () => ({ BASE_URL: "" }));

const mockedAxios = vi.mocked(axios);

describe("contractService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createContract", () => {
    it("posts the correct payload and creates the contract", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await createContract(1, 2);

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/contracts", {
        personId: 1,
        roomId: 2,
        startDate: null,
        endDate: null,
      });
    });

    it("posts with startDate and endDate when provided", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await createContract(1, 2, "2026-06-01", "2026-12-31");

      expect(mockedAxios.post).toHaveBeenCalledWith("/api/contracts", {
        personId: 1,
        roomId: 2,
        startDate: "2026-06-01",
        endDate: "2026-12-31",
      });
    });

    it("propagates errors from the API", async () => {
      const error = new Error("Network error");
      mockedAxios.post = vi.fn().mockRejectedValue(error);

      await expect(createContract(1, 2)).rejects.toThrow("Network error");
    });

    it("returns void on success", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      const result = await createContract(1, 2);

      expect(result).toBeUndefined();
    });
  });
});
