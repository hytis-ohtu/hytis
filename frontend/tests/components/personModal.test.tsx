import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonModal from "../../src/components/PersonModal";
import { findAllDepartments } from "../../src/services/referenceDataService.ts";

vi.mock("../../src/services/referenceDataService", () => ({
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

vi.mock("../../src/services/peopleService", () => ({
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
    onClose: vi.fn(),
    onSubmit: vi.fn(),
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
    fireEvent.click(screen.getByLabelText("Sulje"));
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("confirmation button if clicking outside", async () => {
    await renderAndWait();
    const overlay = screen
      .getByText("Lisää henkilö")
      .closest(".personmodal-content")!.parentElement!;

    fireEvent.click(overlay);

    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("confirmation button if saving", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    expect(screen.getByText("Tallenna muutokset?")).toBeInTheDocument();
  });

  it("disables save button if form is invalid", async () => {
    await renderAndWait();
    const saveButton = screen.getByText("Lisää");
    expect(saveButton).toBeDisabled();
  });

  it("enables save button if form is valid", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    const saveButton = screen.getByText("Tallenna");
    expect(saveButton).toBeEnabled();
  });

  it("calls onSubmit with form data when saving", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    const dialog = screen.getByText("Tallenna muutokset?").closest("div")!;
    fireEvent.click(within(dialog).getByRole("button", { name: "Tallenna" }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(REQUIRED_INITIAL);
  });

  it("calls onClose when confirming close", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByLabelText("Sulje"));
    fireEvent.click(screen.getByText("Kyllä"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("closes confirmation without action on cancel", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByLabelText("Sulje"));
    fireEvent.click(screen.getByText("Peruuta"));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Sulje ilman tallennusta?"),
    ).not.toBeInTheDocument();
  });

  it("clicking inside the modal does not trigger close confirmation", async () => {
    await renderAndWait();
    const content = screen
      .getByText("Lisää henkilö")
      .closest(".personmodal-content")!;
    fireEvent.click(content);
    expect(
      screen.queryByText("Sulje ilman tallennusta?"),
    ).not.toBeInTheDocument();
  });

  it("cancel save confirmation does not save or close", async () => {
    await renderAndWait({ initial: REQUIRED_INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    fireEvent.click(screen.getByText("Peruuta"));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Tallenna muutokset?")).not.toBeInTheDocument();
  });

  it("enables save button after filling in required fields", async () => {
    await renderAndWait();
    expect(screen.getByText("Lisää")).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Etunimi:"), {
      target: { value: "Terppa" },
    });
    fireEvent.change(screen.getByLabelText("Sukunimi:"), {
      target: { value: "Testaaja" },
    });
    expect(screen.getByText("Lisää")).toBeEnabled();
  });
});
