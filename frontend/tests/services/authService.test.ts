import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, login, logout } from "../../src/services/authService";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    defaults: { headers: { common: {} } },
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

vi.mock("../constants", () => ({ BASE_URL: "" }));

const mockedAxios = vi.mocked(axios);

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  });

  describe("getCurrentUser", () => {
    it("returns user data on success", async () => {
      const mockUser = { id: 1, name: "Test User" };
      mockedAxios.get = vi
        .fn()
        .mockResolvedValue({ statusText: "OK", data: mockUser });

      const result = await getCurrentUser();

      expect(result).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith("/api/user", {
        withCredentials: true,
      });
    });

    it("propagates errors from the API", async () => {
      mockedAxios.get = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(getCurrentUser()).rejects.toThrow("Network error");
    });
  });

  describe("logout", () => {
    it("redirects to logoutUrl when provided", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({
        data: { logoutUrl: "https://logout.example.com" },
      });

      await logout();

      expect(window.location.href).toBe("https://logout.example.com");
    });

    it("does not redirect when logoutUrl is not provided", async () => {
      mockedAxios.post = vi.fn().mockResolvedValue({ data: {} });

      await logout();

      expect(window.location.href).toBe("");
    });

    it("propagates errors from the API", async () => {
      mockedAxios.post = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(logout()).rejects.toThrow("Network error");
    });
  });

  describe("login", () => {
    it("redirects to the login endpoint", () => {
      login();

      expect(window.location.href).toBe("/api/login");
    });
  });
});
