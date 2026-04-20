import "@testing-library/jest-dom";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { RoomSelectionProvider } from "../../src/components/RoomSelectionProvider";
import SidePanel from "../../src/components/SidePanel";
import { useRoomSelection } from "../../src/hooks/useRoomSelection";
import { removeContract } from "../../src/services/contractsService";
import {
  addPerson,
  editPerson,
  findAllPeople,
} from "../../src/services/peopleService";
import { editRoom, findRoomById } from "../../src/services/roomsService";
import type { Person, Room } from "../../src/types";
import { testPerson, testRooms } from "../testData";

vi.mock("../../src/services/peopleService", () => ({
  addPerson: vi.fn(),
  editPerson: vi.fn(),
  findAllPeople: vi.fn(),
}));

vi.mock("../../src/services/contractsService", () => ({
  removeContract: vi.fn(),
}));

vi.mock("../../src/services/roomsService", () => ({
  editRoom: vi.fn(),
  findAllRooms: vi.fn(),
  findRoomById: vi.fn(),
}));

vi.mock("../../src/services/referenceDataService", () => ({
  findAllDepartments: vi.fn().mockResolvedValue([
    { id: 516, name: "H516 MATHSTAT" },
    { id: 517, name: "H517 CS" },
    { id: 2, name: "H523 CS" },
  ]),
  findAllRoomTypes: vi.fn().mockResolvedValue([
    { id: 1, name: "konferenssihuone" },
    { id: 2, name: "laboratorio" },
  ]),
  findAllTitles: vi.fn().mockResolvedValue([
    { id: 1, name: "asiantuntija" },
    { id: 2, name: "professori" },
  ]),
  findAllResearchGroups: vi.fn().mockResolvedValue([
    { id: 1, name: "Algoritmit ja optimointi" },
    { id: 2, name: "Tietokannat" },
  ]),
}));

const mockFindRoomById = vi
  .mocked(findRoomById)
  .mockImplementation(async (roomId: number) => {
    if (roomId === testRooms[1].id) {
      return {
        ...testRooms[1],
        contracts: [],
      } as Room;
    } else {
      return testRooms[0] as Room;
    }
  });

vi.mocked(findAllPeople).mockResolvedValue([
  testPerson.supervisors[0] as Person,
  testPerson as Person,
]);

function TestButtons() {
  const { selectRoom } = useRoomSelection();

  return (
    <div>
      <button
        data-testid="open-room"
        onClick={() => {
          void selectRoom(testRooms[0].id);
        }}
      >
        Open room
      </button>
      <button
        data-testid="open-empty-room"
        onClick={() => {
          void selectRoom(testRooms[1].id);
        }}
      >
        Open empty room
      </button>
      <button
        data-testid="open-room-with-person"
        onClick={() => {
          void selectRoom(testRooms[0].id, testPerson.id);
        }}
      >
        Open room with person
      </button>
    </div>
  );
}

function TestDisplay() {
  return (
    <>
      <SidePanel />
      <TestButtons />
    </>
  );
}

const customRender = (ui: ReactElement) => {
  return render(
    <RoomSelectionProvider findRoomById={mockFindRoomById}>
      {ui}
    </RoomSelectionProvider>,
  );
};

describe("RoomInfo", () => {
  it("renders room details when a room is selected", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));

    expect(screen.getByText("63.60 m²")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("konferenssihuone")).toBeInTheDocument();
    expect(screen.getByText("H523 CS")).toBeInTheDocument();
    expect(screen.getByText("Hätäpoistumistie")).toBeInTheDocument();
  });

  it("opens the room edit modal and saves changes", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));
    await user.click(
      screen.getByRole("button", { name: "Muokkaa huoneen tietoja" }),
    );

    expect(screen.getByText("Muokkaa huonetta")).toBeInTheDocument();
    expect(screen.getByDisplayValue("15")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Huonetyyppi:" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tallenna" }));

    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Tallenna" }));

    expect(editRoom).toHaveBeenCalledWith(
      testRooms[0].id,
      expect.objectContaining({
        capacity: "15",
        roomType: "1",
        department: "2",
        freeText: "Hätäpoistumistie",
      }),
    );
  });

  it.fails("does not close the modal when edit fails", async () => {
    const user = userEvent.setup();

    vi.mocked(editRoom).mockRejectedValueOnce(new Error());

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));
    await user.click(
      screen.getByRole("button", { name: "Muokkaa huoneen tietoja" }),
    );

    await user.click(screen.getByRole("button", { name: "Tallenna" }));

    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Tallenna" }));

    expect(confirm).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Tallenna" }),
    ).toBeInTheDocument();
  });

  it.todo("displays an error message when editing fails");
});

describe("RoomPeople", () => {
  it("adds a new person through the modal succesfully", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));
    await user.click(
      screen.getByRole("button", {
        name: "Sijoita henkilö huoneeseen",
      }),
    );

    await user.type(screen.getByLabelText("Etunimi:"), "Uusi");
    await user.type(screen.getByLabelText("Sukunimi:"), "Henkilö");

    await user.click(screen.getByRole("button", { name: "Lisää" }));

    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Tallenna" }));

    expect(addPerson).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: "Uusi",
        lastName: "Henkilö",
      }),
      testRooms[0].id,
    );
  });

  it.fails("does not close the modal when adding fails", async () => {
    const user = userEvent.setup();

    vi.mocked(addPerson).mockRejectedValueOnce(new Error());

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));
    await user.click(
      screen.getByRole("button", {
        name: "Sijoita henkilö huoneeseen",
      }),
    );

    await user.type(screen.getByLabelText("Etunimi:"), "Uusi");
    await user.type(screen.getByLabelText("Sukunimi:"), "Henkilö");

    await user.click(screen.getByRole("button", { name: "Lisää" }));

    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Tallenna" }));

    expect(confirm).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Lisää" })).toBeInTheDocument();
  });

  it("opens the edit person modal with correct initial values and saves edits", async () => {
    const user = userEvent.setup();

    vi.mocked(editPerson).mockResolvedValueOnce(testPerson as Person);

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));

    const personCard = screen.getByRole("article", { name: "Virtanen Matti" });
    await user.click(
      within(personCard).getByRole("button", {
        name: "Muokkaa henkilön tietoja",
      }),
    );

    await user.click(screen.getByRole("button", { name: "Tallenna" }));

    const confirm = await screen.findByRole("alertdialog");
    await user.click(within(confirm).getByRole("button", { name: "Tallenna" }));

    expect(editPerson).toHaveBeenCalledWith(
      testPerson.id,
      expect.objectContaining({
        firstName: "Matti",
        lastName: "Virtanen",
        startDate: "2023-01-01",
        endDate: "2025-12-31",
      }),
      testRooms[0].id,
    );
  });

  it("removes a contract successfully", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));

    const personCard = screen.getByRole("article", { name: "Virtanen Matti" });
    await user.click(
      within(personCard).getByRole("button", {
        name: "Poista henkilö",
      }),
    );

    expect(screen.getByText("Poista Matti Virtanen?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Poista" }));

    expect(removeContract).toHaveBeenCalledWith(1);
  });

  it("dismisses the remove confirmation dialog when clicking cancel", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room"));

    const personCard = screen.getByRole("article", { name: "Virtanen Matti" });
    await user.click(
      within(personCard).getByRole("button", {
        name: "Poista henkilö",
      }),
    );

    expect(screen.getByText("Poista Matti Virtanen?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Peruuta" }));

    expect(
      screen.queryByText("Poista Matti Virtanen?"),
    ).not.toBeInTheDocument();
    expect(removeContract).not.toHaveBeenCalled();
  });

  it("shows the no contracts message when the selected room has no people", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-empty-room"));
    await screen.findByRole("heading", { name: /huone a211/i });

    expect(screen.getByText("Ei henkilöitä.")).toBeInTheDocument();
  });

  it("expands person details when the room is opened with a person selection", async () => {
    const user = userEvent.setup();

    customRender(<TestDisplay />);

    await user.click(screen.getByTestId("open-room-with-person"));

    await screen.findByText("H516 MATHSTAT");
    expect(screen.getByText("Osasto")).toBeInTheDocument();
    expect(screen.getByText("Titteli")).toBeInTheDocument();
    expect(screen.getByText("Tutkimusryhmä")).toBeInTheDocument();
    expect(screen.getByText("Esihenkilöt")).toBeInTheDocument();
    expect(screen.getByText("Tämä on testihenkilö")).toBeInTheDocument();
  });

  it.todo("shows an error message when editing fails");
});
