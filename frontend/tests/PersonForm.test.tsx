import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonForm from "../src/components/PersonForm.tsx";

vi.mock("../src/services/personService", () => ({
  findAllPersons: vi.fn().mockResolvedValue([
    { id: 1, firstName: "Matti", lastName: "Meikäläinen" },
    { id: 2, firstName: "Maija", lastName: "Meikäläinen" },
  ]),
}));

vi.mock("../src/services/referenceDataService", () => ({
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

const REQUIRED_INITIAL = {
  firstName: "Terppa",
  lastName: "Testaaja",
};

describe("PersonForm", () => {
  const defaultProps = {
    onChange: vi.fn(),
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Etunimi:")).toBeInTheDocument();
  });

  it("renders all fields", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Etunimi:")).toBeInTheDocument();
    expect(screen.getByLabelText("Sukunimi:")).toBeInTheDocument();
    expect(screen.getByLabelText("Osasto:")).toBeInTheDocument();
    expect(screen.getByLabelText("Työnimike:")).toBeInTheDocument();
    expect(screen.getByLabelText("Esihenkilö(t):")).toBeInTheDocument();
    expect(screen.getByLabelText("Sopimuksen alku:")).toBeInTheDocument();
    expect(screen.getByLabelText("Sopimuksen loppu:")).toBeInTheDocument();
    expect(screen.getByLabelText("Tutkimusryhmä:")).toBeInTheDocument();
    expect(screen.getByLabelText("Muut tiedot:")).toBeInTheDocument();
  });

  it("renders with empty fields by default", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Etunimi:")).toHaveValue("");
    expect(screen.getByLabelText("Sukunimi:")).toHaveValue("");
    // selects default to "" (the placeholder option)
    expect(screen.getByLabelText("Osasto:")).toHaveValue("");
  });

  it("renders with initial text values pre-filled", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    expect(screen.getByDisplayValue("Terppa")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Testaaja")).toBeInTheDocument();
  });

  it("calls onChange on mount with initial values and validity", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith(REQUIRED_INITIAL, true);
  });

  it("calls onChange on mount with empty values and invalid state", () => {
    render(<PersonForm {...defaultProps} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith({}, false);
  });

  it("calls onChange with updated values when a text field changes", () => {
    render(<PersonForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText("Etunimi:"), {
      target: { value: "Matti" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ firstName: "Matti" }),
      false,
    );
  });

  it("updates state when a select changes (line 68)", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    const select = screen.getByLabelText("Osasto:") as HTMLSelectElement;
    select.value = "1";
    fireEvent.change(select);
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it("reports valid when all required fields are filled", () => {
    render(<PersonForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText("Etunimi:"), {
      target: { value: "Terppa" },
    });
    fireEvent.change(screen.getByLabelText("Sukunimi:"), {
      target: { value: "Testaaja" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining(REQUIRED_INITIAL),
      true,
    );
  });

  it("reports invalid when a required field is cleared", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Etunimi:"), {
      target: { value: "" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ firstName: "" }),
      false,
    );
  });

  it("reports invalid when a required field is only whitespace", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Etunimi:"), {
      target: { value: "   " },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ firstName: "   " }),
      false,
    );
  });

  it("optional fields do not affect validity", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Muut tiedot:"), {
      target: { value: "" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ ...REQUIRED_INITIAL }),
      true,
    );
  });

  it("date fields accept date values", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Sopimuksen alku:"), {
      target: { value: "2025-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Sopimuksen loppu:"), {
      target: { value: "2026-01-01" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        startDate: "2025-01-01",
        endDate: "2026-01-01",
      }),
      true,
    );
  });

  it("renders fetched options in dropdowns", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Developer" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "Group A" }),
      ).toBeInTheDocument();
    });
  });
});
