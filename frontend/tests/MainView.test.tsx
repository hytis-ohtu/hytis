import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { findAllRooms } from "../src/services/roomsService";
import MainView from "../src/components/MainView.tsx";

vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("../src/assets/exactum-2.min.svg?react", () => ({
  default: () => <svg data-testid="mock-svg" />,
}));

vi.mock("../src/services/roomsService");

describe("MainView", () => {
  it("renders without crashing", () => {
    vi.mocked(findAllRooms).mockResolvedValue([]);
    render(<MainView />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
  });
});
