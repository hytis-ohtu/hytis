import PersonModal from "@components/PersonModal/PersonModal";
import { findAllDepartments } from "@services/referenceDataService.ts";
import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@services/referenceDataService", () => ({
  findAllDepartments: vi.fn().mockResolvedValue([
    { id: 1, name: "IT" },
    { id: 2, name: "HR" },
  ]),
  findAllTitles: vi.fn().mockResolvedValue([
    { id: 1, name: "Developer" },
    { id: 2, name: "Manager" },
  ]),
  findAllResearchGroups: vi.fn().mockResolvedValue([
    { id: 1, name: "Group A" },
    { id: 2, name: "Group B" },
  ]),
}));

vi.mock("@services/peopleService", () => ({
  findAllPeople: vi
    .fn()
    .mockResolvedValue([{ id: 1, firstName: "Supervisor", lastName: "One" }]),
  searchPeople: vi.fn().mockResolvedValue([]),
  addPerson: vi.fn().mockResolvedValue({}),
}));

const REQUIRED_INITIAL = {
  firstName: "Matti",
  lastName: "Meikäläinen",
  department: "1",
  jobtitle: "1",
  supervisors: "1",
  startDate: "2025-01-01",
  endDate: "2026-01-01",
};

describe("PersonModal", () => {
  const defaultProps = {
    onSave: vi.fn(),
    onClose: vi.fn(),
  };

  // Helper that renders and waits for async data fetching to complete
  const renderAndWait = async (
    props: Partial<typeof defaultProps> & {
      initial?: Record<string, string>;
    } = {},
  ) => {
    render(<PersonModal {...defaultProps} {...props} />);
    await waitFor(() => expect(findAllDepartments).toHaveBeenCalled());
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    await renderAndWait();
    expect(screen.getByText("Lisää henkilö")).toBeInTheDocument();
  });

  it("renders with initial values for editing", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    expect(screen.getByText("Muokkaa henkilöä")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Matti")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Meikäläinen")).toBeInTheDocument();
  });

  it("confirmation button if closing", async () => {
    await renderAndWait();
    fireEvent.click(
      screen.getByRole("button", { name: "Sulje henkilön lisäys" }),
    );
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("confirmation button if pressing escape", async () => {
    await renderAndWait();
    const dialog = screen.getByRole("dialog", { name: "Lisää henkilö" });
    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("confirmation button if saving", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByRole("button", { name: "Tallenna" }));
    expect(screen.getByText("Tallenna muutokset?")).toBeInTheDocument();
  });

  it("disables save button if form is invalid", async () => {
    await renderAndWait();
    const saveButton = screen.getByRole("button", { name: "Lisää" });
    expect(saveButton).toBeDisabled();
  });

  it("enables save button if form is valid", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    const saveButton = screen.getByRole("button", { name: "Tallenna" });
    expect(saveButton).toBeEnabled();
  });

  it("calls onSave with form data when saving", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByRole("button", { name: "Tallenna" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Tallenna muutokset?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Tallenna" }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(REQUIRED_INITIAL);
  });

  it("calls onClose when confirming close", async () => {
    await renderAndWait();
    fireEvent.click(
      screen.getByRole("button", { name: "Sulje henkilön lisäys" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Sulje ilman tallennusta?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Kyllä" }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("closes confirmation without action on cancel", async () => {
    await renderAndWait();
    fireEvent.click(
      screen.getByRole("button", { name: "Sulje henkilön lisäys" }),
    );
    const dialog = await screen.findByRole("alertdialog", {
      name: "Sulje ilman tallennusta?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Peruuta" }));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("clicking inside the modal does not trigger close confirmation", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole("heading", { name: "Lisää henkilö" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("cancel save confirmation does not save or close", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByRole("button", { name: "Tallenna" }));
    const dialog = await screen.findByRole("alertdialog", {
      name: "Tallenna muutokset?",
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Peruuta" }));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(dialog).not.toHaveAttribute("open");
  });

  it("enables save button after filling in required fields", async () => {
    await renderAndWait();
    expect(screen.getByRole("button", { name: "Lisää" })).toBeDisabled();

    fireEvent.change(screen.getByRole("textbox", { name: "Etunimi:" }), {
      target: { value: "Terppa" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Sukunimi:" }), {
      target: { value: "Testaaja" },
    });
    expect(screen.getByRole("button", { name: "Lisää" })).toBeEnabled();
  });
});
