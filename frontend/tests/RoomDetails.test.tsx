import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RoomDetails from "../src/components/RoomDetails.tsx";
import type { Room } from "../src/types.ts";

const mockHandleClose = vi.fn();

const mockRoom: Room = {
  id: 1,
  name: "A210",
  area: "63.6",
  capacity: 15,
  contracts: [],
};

describe("RoomDetails", () => {
  it("renders nothing if there is no room data", () => {
    const { container } = render(
      <RoomDetails room={null} handleClose={mockHandleClose} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders room details panel when room data is provided", () => {
    render(<RoomDetails room={mockRoom} handleClose={mockHandleClose} />);
    expect(screen.getByRole("heading", { name: "Huone" })).toBeDefined();
    expect(screen.getByRole("heading", { name: mockRoom.name })).toBeDefined();
  });

  it("room details panel can be closed", async () => {
    const user = userEvent.setup();
    render(<RoomDetails room={mockRoom} handleClose={mockHandleClose} />);

    await user.click(screen.getByTestId("close-room-details-panel"));

    expect(mockHandleClose).toHaveBeenCalled();
  });
});
