import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RoomDetails from "../src/components/RoomDetails.tsx";
import SidePanel from "../src/components/SidePanel.tsx";
import { addPerson, editPerson } from "../src/services/peopleService";
import type { Room } from "../src/types.ts";

vi.mock("../src/services/peopleService", () => ({
  addPerson: vi.fn(),
  editPerson: vi.fn(),
}));

vi.mock("../src/components/PersonModal", () => ({
  default: ({
    onClose,
    onSubmit,
    initial,
  }: {
    onClose: () => void;
    onSubmit?: (values: Record<string, string>) => void;
    initial?: Record<string, string>;
  }) => (
    <div>
      <button data-testid="mock-personmodal-close" onClick={onClose}>
        Mock Close
      </button>
      <button
        data-testid="mock-personmodal-submit"
        onClick={() =>
          onSubmit?.({
            firstName: initial?.firstName ?? "Test",
            lastName: initial?.lastName ?? "User",
            startDate: initial?.startDate ?? "2026-01-01",
            endDate: initial?.endDate ?? "2026-12-31",
          })
        }
      >
        Mock Submit
      </button>
      {initial && Object.keys(initial).length > 0 && (
        <div data-testid="mock-personmodal-initial">
          {JSON.stringify(initial)}
        </div>
      )}
    </div>
  ),
}));

const mockHandleClose = vi.fn();
const mockOnPersonSaved = vi.fn();

const mockRoom_A210: Room = {
  id: 1,
  name: "A210",
  area: "63.6",
  capacity: 15,
  contracts: [
    {
      id: 1,
      startDate: "2023-01-01",
      endDate: "2025-12-31",
      person: {
        id: 1,
        firstName: "Matti",
        lastName: "Virtanen",
        department: {
          id: 516,
          name: "H516 MATHSTAT",
        },
        title: {
          id: 1,
          name: "asiantuntija",
        },
        researchGroup: {
          id: 1,
          name: "Algoritmit ja optimointi",
        },
        supervisors: [
          {
            id: 2,
            firstName: "Liisa",
            lastName: "Lahtinen",
            department: {
              id: 517,
              name: "H517 CS",
            },
            title: {
              id: 2,
              name: "professori",
            },
            researchGroup: {
              id: 2,
              name: "Tietokannat",
            },
            supervisors: [],
            freeText: null,
          },
        ],
        freeText: "Tämä on testihenkilö",
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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early from handleAddPerson when room id is undefined", async () => {
    const user = userEvent.setup();
    const onPersonSaved = vi.fn();

    render(
      <SidePanel
        room={null}
        handleClose={mockHandleClose}
        onPersonSaved={onPersonSaved}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Lisää henkilö" }));
    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(addPerson).not.toHaveBeenCalled();
    expect(onPersonSaved).not.toHaveBeenCalled();
  });

  it("renders loading skeleton when data is being fetched", () => {
    const { container } = render(
      <SidePanel
        room={null}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );
    expect(
      container.querySelector(".react-loading-skeleton"),
    ).toBeInTheDocument();
  });

  it("handles addPerson error state and logs the failure", async () => {
    const user = userEvent.setup();
    const onPersonSaved = vi.fn();
    const addPersonError = new Error("network failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.mocked(addPerson).mockRejectedValueOnce(addPersonError);

    render(
      <SidePanel
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={onPersonSaved}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Lisää henkilö" }));
    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(addPerson).toHaveBeenCalled();
    expect(onPersonSaved).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to add person:",
      addPersonError,
    );

    consoleErrorSpy.mockRestore();
  });

  it("opens edit mode with person initial values and saves edits", async () => {
    const user = userEvent.setup();
    vi.mocked(editPerson).mockResolvedValueOnce(
      mockRoom_A210.contracts[0].person,
    );

    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    await user.click(screen.getByTestId("edit-person-button-1"));

    expect(screen.getByTestId("mock-personmodal-initial")).toHaveTextContent(
      '"firstName":"Matti"',
    );
    expect(screen.getByTestId("mock-personmodal-initial")).toHaveTextContent(
      '"lastName":"Virtanen"',
    );

    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(editPerson).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        firstName: "Matti",
        lastName: "Virtanen",
        startDate: "2023-01-01",
        endDate: "2025-12-31",
      }),
      1,
    );
    expect(mockOnPersonSaved).toHaveBeenCalled();
  });

  it("resets edit state when the modal is closed", async () => {
    const user = userEvent.setup();

    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    await user.click(screen.getByTestId("edit-person-button-1"));
    expect(screen.getByTestId("mock-personmodal-initial")).toHaveTextContent(
      '"firstName":"Matti"',
    );

    await user.click(screen.getByTestId("mock-personmodal-close"));
    await user.click(screen.getByRole("button", { name: "Lisää henkilö" }));

    expect(
      screen.queryByTestId("mock-personmodal-initial"),
    ).not.toBeInTheDocument();
  });

  it("handles editPerson error state and logs the failure", async () => {
    const user = userEvent.setup();
    const editPersonError = new Error("update failed");
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    vi.mocked(editPerson).mockRejectedValueOnce(editPersonError);

    render(
      <RoomDetails
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    await user.click(screen.getByTestId("edit-person-button-1"));
    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(editPerson).toHaveBeenCalled();
    expect(mockOnPersonSaved).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to edit person:",
      editPersonError,
    );

    consoleErrorSpy.mockRestore();
  });

  it("returns early from handleEditPerson when person id is undefined", async () => {
    const user = userEvent.setup();
    const roomWithPersonMissingId = {
      ...mockRoom_A210,
      contracts: [
        {
          ...mockRoom_A210.contracts[0],
          person: {
            ...mockRoom_A210.contracts[0].person,
            id: undefined,
          },
        },
      ],
    };

    render(
      <RoomDetails
        // @ts-expect-error - Intentionally setting id to undefined to test the guard clause
        room={roomWithPersonMissingId}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    await user.click(screen.getByTestId("edit-person-button-undefined"));
    await user.click(screen.getByTestId("mock-personmodal-submit"));

    expect(editPerson).not.toHaveBeenCalled();
    expect(mockOnPersonSaved).not.toHaveBeenCalled();
  });

  it("renders room details panel when room data is provided", () => {
    render(
      <SidePanel
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
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
      <SidePanel
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    const contract = mockRoom_A210.contracts[0];
    const fullName = `${contract.person.firstName} ${contract.person.lastName}`;

    const summary = screen.getByText(fullName);
    expect(summary).toBeInTheDocument();

    await user.click(summary);

    expect(screen.getByTestId("edit-person-button-1")).toBeInTheDocument();
    expect(screen.getByText(`Osasto: H516 MATHSTAT`)).toBeInTheDocument();
    expect(screen.getByText(`Titteli: asiantuntija`)).toBeInTheDocument();
    expect(
      screen.getByText(`Tutkimusryhmä: Algoritmit ja optimointi`),
    ).toBeInTheDocument();
    expect(screen.getByText(`Esihenkilöt: Liisa Lahtinen`)).toBeInTheDocument();
    expect(screen.getByText(`Alkupvm: 2023-01-01`)).toBeInTheDocument();
    expect(screen.getByText(`Loppupvm: 2025-12-31`)).toBeInTheDocument();
    expect(
      screen.getByText(`Lisätiedot: Tämä on testihenkilö`),
    ).toBeInTheDocument();
    expect(screen.queryByText("this is wrong")).not.toBeInTheDocument();
  });

  it("renders room details panel when room data is provided", () => {
    render(
      <SidePanel
        room={mockRoom_A219}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );
    expect(screen.getByRole("heading", { name: "Huone" })).toBeDefined();
    expect(screen.getByText("Ei sopimuksia.")).toBeInTheDocument();
  });
  it("room details panel can be closed", async () => {
    const user = userEvent.setup();
    render(
      <SidePanel
        room={mockRoom_A210}
        handleClose={mockHandleClose}
        onPersonSaved={mockOnPersonSaved}
      />,
    );

    await user.click(screen.getByTestId("close-room-details-panel"));

    expect(mockHandleClose).toHaveBeenCalled();
  });
});
