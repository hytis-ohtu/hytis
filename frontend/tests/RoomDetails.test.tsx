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
  contracts: [
    {
      startDate: "2023-01-01",
      endDate: "2025-12-31",
      person: {
        firstName: "Matti",
        lastName: "Virtanen",
        department: {
          id: 516,
          name: "H516 MATHSTAT",
        },
        title: {
          name: "asiantuntija",
        },
      },
    },
  ],
  department: {
    id: 2,
    name: "H523 CS",
  },
  freeText: "Hätäpoistumistie",
  roomType: "Konferenssihuone",
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
    expect(screen.getByText("Pinta-ala: 63.6 m²")).toBeInTheDocument();
    expect(screen.getByText("Kapasiteetti: 15")).toBeInTheDocument();
    expect(
      screen.getByText("Huonetyyppi: Konferenssihuone"),
    ).toBeInTheDocument();
    expect(screen.getByText("Osasto: H523 CS")).toBeInTheDocument();
    expect(
      screen.getByText("Lisätiedot: Hätäpoistumistie"),
    ).toBeInTheDocument();
    expect(screen.queryByText("this is wrong")).not.toBeInTheDocument();
  });

  it("renders valid mock person details on sidepanel", async () => {
    const user = userEvent.setup();
    render(<RoomDetails room={mockRoom} handleClose={mockHandleClose} />);

    const contract = mockRoom.contracts[0];
    const fullName = `${contract.person.firstName} ${contract.person.lastName}`;

    const summary = screen.getByText(fullName);
    expect(summary).toBeInTheDocument();

    await user.click(summary);

    expect(screen.getByText(`Osasto: H516 MATHSTAT`)).toBeInTheDocument();
    expect(screen.getByText(`Titteli: asiantuntija`)).toBeInTheDocument();
    expect(screen.getByText(`Alkupvm: 2023-01-01`)).toBeInTheDocument();
    expect(screen.getByText(`Loppupvm: 2025-12-31`)).toBeInTheDocument();
    expect(screen.queryByText("this is wrong")).not.toBeInTheDocument();
  });

  it("room details panel can be closed", async () => {
    const user = userEvent.setup();
    render(<RoomDetails room={mockRoom} handleClose={mockHandleClose} />);

    await user.click(screen.getByTestId("close-room-details-panel"));

    expect(mockHandleClose).toHaveBeenCalled();
  });
});
