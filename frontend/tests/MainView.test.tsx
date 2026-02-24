import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MainView from "../src/components/MainView.tsx";
import { findAllRooms } from "../src/services/roomsService";
import { rooms } from "./testData.ts";

vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("../src/assets/exactum-2.min.svg?react", () => ({
  default: () => (
    <svg data-testid="mock-svg">
      <path
        d="M1325.291-1106.835h-9.448v127.748h278.74v-330.33h-274.016v8.315h4.724v9.449h-4.724v175.37h4.724z"
        data-room="A210"
      />
    </svg>
  ),
}));

vi.mock("../src/services/roomsService");

describe("MainView", () => {
  it("renders without crashing", () => {
    vi.mocked(findAllRooms).mockResolvedValue([]);
    render(<MainView />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
  });

  it("maps rooms data correctly to SVG elements", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

    await waitFor(() => {
      const roomElement = document.querySelector('[data-room="A210"]');
      expect(roomElement).toHaveAttribute("id", "1");
      expect(roomElement).toHaveClass("room");
      expect(roomElement).toHaveClass("available");
    });
  });
});
