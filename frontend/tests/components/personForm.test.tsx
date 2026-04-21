import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonForm from "../../src/components/PersonForm.tsx";

vi.mock("../../src/services/peopleService", () => ({
  findAllPeople: vi.fn().mockResolvedValue([
    { id: 1, firstName: "Joku", lastName: "Esihenkilö" },
    { id: 2, firstName: "Muu", lastName: "Esihenkilö" },
  ]),
}));

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

const REQUIRED_INITIAL = {
  firstName: "Terppa",
  lastName: "Testaaja",
  department: "1",
  jobtitle: "1",
  supervisors: "",
  startDate: "2025-01-01",
  endDate: "2026-01-01",
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

  it("updates state when a select changes", async () => {
    const user = userEvent.setup();
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);

    const select = screen.getByLabelText("Osasto:");
    await user.selectOptions(select, "1");

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
      expect.objectContaining({ firstName: "Terppa", lastName: "Testaaja" }),
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
      expect.objectContaining({ firstName: "Terppa", lastName: "Testaaja" }),
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

  it("focusing the supervisor input opens the dropdown", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
  });

  it("typing in the supervisor input filters the list", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    fireEvent.change(screen.getByLabelText("Esihenkilö(t):"), {
      target: { value: "Joku" },
    });
    expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    expect(screen.queryByText("Muu Esihenkilö")).not.toBeInTheDocument();
  });

  it("shows 'Ei tuloksia' when supervisor search matches nobody", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Esihenkilö(t):"), {
      target: { value: "zzznomatch" },
    });
    expect(screen.getByText("Ei tuloksia")).toBeInTheDocument();
  });

  it("clicking a supervisor in the dropdown adds them as a tag", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    expect(screen.getByLabelText("Poista Joku Esihenkilö")).toBeInTheDocument();
  });

  it("clicking a selected supervisor in the dropdown removes them", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    // Select
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    // Reopen and click the list item specifically to deselect
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    const listItem = screen
      .getAllByText("Joku Esihenkilö")
      .find((el) => el.tagName === "LI")!;
    fireEvent.click(listItem);
    expect(
      screen.queryByLabelText("Poista Joku Esihenkilö"),
    ).not.toBeInTheDocument();
  });

  it("clicking the remove tag button deselects a supervisor", async () => {
    render(<PersonForm {...defaultProps} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    fireEvent.click(screen.getByLabelText("Poista Joku Esihenkilö"));
    expect(
      screen.queryByLabelText("Poista Joku Esihenkilö"),
    ).not.toBeInTheDocument();
  });

  it("clicking outside the supervisor widget closes the dropdown", async () => {
    render(
      <div>
        <PersonForm {...defaultProps} />
        <button>outside</button>
      </div>,
    );
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    fireEvent.focus(screen.getByLabelText("Esihenkilö(t):"));
    expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByText("Joku Esihenkilö")).not.toBeInTheDocument();
  });

  it("does not render a tag for a supervisor ID with no matching person", async () => {
    render(
      <PersonForm
        {...defaultProps}
        initial={{ ...REQUIRED_INITIAL, supervisors: "999" }}
      />,
    );
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument(),
    );
    // ID 999 has no matching person — no tag should appear
    expect(screen.queryByLabelText(/^Poista /)).not.toBeInTheDocument();
  });

  it("shows existing person search input", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Hae henkilö:")).toBeInTheDocument();
  });

  it("filters existing people by name when typing in search", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Joku" } });
    await waitFor(() => {
      expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    });
    expect(screen.queryByText("Muu Esihenkilö")).not.toBeInTheDocument();
  });

  it("shows 'Ei tuloksia' when search matches no people", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "zzznomatch" } });
    await waitFor(() => {
      expect(screen.getByText("Ei tuloksia")).toBeInTheDocument();
    });
  });

  it("populates form fields when existing person is selected", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Joku" } });
    await waitFor(() => {
      expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    await waitFor(() => {
      expect(screen.getByDisplayValue("Joku")).toHaveValue("Joku");
      expect(screen.getByDisplayValue("Esihenkilö")).toHaveValue("Esihenkilö");
    });
  });

  it("disables person detail fields when existing person is selected", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Joku" } });
    await waitFor(() => {
      expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    await waitFor(() => {
      expect(screen.getByLabelText("Etunimi:")).toBeDisabled();
      expect(screen.getByLabelText("Sukunimi:")).toBeDisabled();
      expect(screen.getByLabelText("Osasto:")).toBeDisabled();
      expect(screen.getByLabelText("Työnimike:")).toBeDisabled();
      expect(screen.getByLabelText("Tutkimusryhmä:")).toBeDisabled();
      expect(screen.getByLabelText("Muut tiedot:")).toBeDisabled();
    });
  });

  it("keeps contract date fields editable when existing person is selected", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Joku" } });
    await waitFor(() => {
      expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    await waitFor(() => {
      expect(screen.getByLabelText("Sopimuksen alku:")).not.toBeDisabled();
      expect(screen.getByLabelText("Sopimuksen loppu:")).not.toBeDisabled();
    });
  });

  it("clears search input after selecting a person", async () => {
    render(<PersonForm {...defaultProps} />);
    const searchInput = screen.getByLabelText("Hae henkilö:");
    fireEvent.focus(searchInput);
    fireEvent.change(searchInput, { target: { value: "Joku" } });
    await waitFor(() => {
      expect(screen.getByText("Joku Esihenkilö")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Joku Esihenkilö"));
    await waitFor(() => {
      expect(searchInput).toHaveValue("");
    });
  });
});
