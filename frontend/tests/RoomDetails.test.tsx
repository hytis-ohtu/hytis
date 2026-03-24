import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RoomDetails from "../src/components/RoomDetails.tsx";
import { addPerson } from "../src/services/peopleService";
import type { Room } from "../src/types.ts";

vi.mock("../src/services/peopleService", () => ({
  addPerson: vi.fn(),
}));

vi.mock("../src/components/PersonModal", () => ({
  default: ({
    onSubmit,
  }: {
    onSubmit?: (values: Record<string, string>) => void;
  }) => (
    <button
      data-testid="mock-personmodal-submit"
      onClick={() =>
        onSubmit?.({
          firstName: "Test",
          lastName: "User",
          startDate: "2026-01-01",
          endDate: "2026-12-31",
        })
      }
    >
      Mock Submit
    </button>
  ),
}));

const mockHandleClose = vi.fn();
const mockOnPersonAdded = vi.fn();

const mockRoom_A210: Room = {
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

const mockRoom_A219: Room = {
  id: 1,
  name: "A219",
  area: "21.40",
  capacity: 5,
  contracts: [],
  department: {
    id: 2,
    name: "H523 CS",
  },
  freeText: "Hätäpoistumistie",
  roomType: "Konferenssihuone",
};

describe("RoomDetails", () => {
  it("returns early from handleAddPerson when room id is undefined", async () => {
    const user = userEvent.setup();
    const onPersonAdded = vi.fn();

    render(
      <RoomDetails
        room={null}
        handleClose={mockHandleClose}
        onPersonAdded={onPersonAdded}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Lisää henkilö" }));
    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(addPerson).not.toHaveBeenCalled();
    expect(onPersonAdded).not.toHaveBeenCalled();
  });

  it("renders loading skeleton when data is being fetched", () => {
    const { container } = render(
      <RoomDetails
        room={null}
        handleClose={mockHandleClose}
        onPersonAdded={mockOnPersonAdded}
      />,
    );
    expect(
      container.querySelector(".react-loading-skeleton"),
    ).toBeInTheDocument();
  });

  it("renders room details panel when room data is provided", () => {
    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonAdded={mockOnPersonAdded}
      />,
    );
    expect(screen.getByRole("heading", { name: "Huone" })).toBeDefined();
    expect(
      screen.getByRole("heading", { name: mockRoom_A210.name }),
    ).toBeDefined();
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
    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonAdded={mockOnPersonAdded}
      />,
    );

    const contract = mockRoom_A210.contracts[0];
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

  it("renders room details panel when room data is provided", () => {
    render(
      <RoomDetails
        room={mockRoom_A219}
        handleClose={mockHandleClose}
        onPersonAdded={mockOnPersonAdded}
      />,
    );
    expect(screen.getByRole("heading", { name: "Huone" })).toBeDefined();
    expect(screen.getByText("Ei sopimuksia.")).toBeInTheDocument();
  });
  it("room details panel can be closed", async () => {
    const user = userEvent.setup();
    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonAdded={mockOnPersonAdded}
      />,
    );

    await user.click(screen.getByTestId("close-room-details-panel"));

    expect(mockHandleClose).toHaveBeenCalled();
  });
});
