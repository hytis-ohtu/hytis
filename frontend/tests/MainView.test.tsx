import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MainView from "../src/components/MainView.tsx";
import {
  AvailabilityColors,
  DepartmentColors,
} from "../src/hooks/useRoomColors.ts";
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
        d="M1325.291-1106.835h-9.448v127.748h278.74v-330.33h-274.016v8.315h4.724v9.449h-4.724v175.37h4.724zm166.678-9.448h9.448v9.448h-9.448zm0-184.82h9.448v9.45h-9.448z"
        data-room="A210"
      />
      <path d="M1598.93-1309.417v144h145.322v-144z" data-room="A211" />
      <path
        d="M1750.866-1291.653h-2.835v126.236h96v-144h-98.834v8.315h5.67z"
        data-room="A212"
      />
    </svg>
  ),
}));

vi.mock("../src/services/roomsService");

describe("MainView", () => {
  it("renders without crashing", () => {
    vi.mocked(findAllRooms).mockResolvedValue([]);
    render(<MainView />);
    expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
  });

  it("maps rooms data correctly to SVG elements", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

    await waitFor(() => {
      const availableRoom = document.querySelector('[data-room="A210"]');
      expect(availableRoom).toHaveAttribute("id", "1");
      expect(availableRoom).toHaveClass("room");
      expect(
        availableRoom instanceof SVGGraphicsElement &&
          availableRoom.style.fill === AvailabilityColors["available"],
      );

      const limitedRoom = document.querySelector('[data-room="A211"]');
      expect(limitedRoom).toHaveAttribute("id", "2");
      expect(limitedRoom).toHaveClass("room");
      expect(
        availableRoom instanceof SVGGraphicsElement &&
          availableRoom.style.fill === AvailabilityColors["limited"],
      );

      const fullRoom = document.querySelector('[data-room="A212"]');
      expect(fullRoom).toHaveAttribute("id", "3");
      expect(fullRoom).toHaveClass("room");
      expect(
        availableRoom instanceof SVGGraphicsElement &&
          availableRoom.style.fill === AvailabilityColors["full"],
      );
    });
  });

  it("room colors change correctly when showing departments", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

    const user = userEvent.setup();
    user.click(screen.getByTestId("switch-color-mode"));

    await waitFor(() => {
      const room = document.querySelector('[data-room="A210"]');
      expect(
        room instanceof SVGGraphicsElement &&
          room.style.fill === DepartmentColors[rooms[0].department.name],
      );
    });
  });
});
