import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PersonForm from "../src/components/PersonForm.tsx";

const REQUIRED_INITIAL = {
  name: "Terppa Testaaja",
  department: "CS",
  jobtitle: "Testaaja",
  supervisors: "Liisa Esihenkilö",
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
    expect(screen.getByLabelText("Nimi:")).toBeInTheDocument();
  });

  it("renders all fields", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Nimi:")).toBeInTheDocument();
    expect(screen.getByLabelText("Osasto:")).toBeInTheDocument();
    expect(screen.getByLabelText("Työnimike:")).toBeInTheDocument();
    expect(screen.getByLabelText("Esihenkilö(t):")).toBeInTheDocument();
    expect(screen.getByLabelText("Sopimusalku:")).toBeInTheDocument();
    expect(screen.getByLabelText("Sopimusloppu:")).toBeInTheDocument();
    expect(screen.getByLabelText("Tutkimusryhmä:")).toBeInTheDocument();
    expect(screen.getByLabelText("Muut tiedot:")).toBeInTheDocument();
  });

  it("renders with empty fields by default", () => {
    render(<PersonForm {...defaultProps} />);
    expect(screen.getByLabelText("Nimi:")).toHaveValue("");
    expect(screen.getByLabelText("Osasto:")).toHaveValue("");
  });

  it("renders with initial values pre-filled", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    Object.values(REQUIRED_INITIAL).forEach((value) => {
      expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    });
  });

  it("calls onChange on mount with initial values and validity", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith(REQUIRED_INITIAL, true);
  });

  it("calls onChange on mount with empty values and invalid state", () => {
    render(<PersonForm {...defaultProps} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith({}, false);
  });

  it("calls onChange with updated values when a field changes", () => {
    render(<PersonForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText("Nimi:"), {
      target: { value: "Matti" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Matti" }),
      false,
    );
  });

  it("reports valid when all required fields are filled", () => {
    render(<PersonForm {...defaultProps} />);
    fireEvent.change(screen.getByLabelText("Nimi:"), {
      target: { value: "Terppa Testaaja" },
    });
    fireEvent.change(screen.getByLabelText("Osasto:"), {
      target: { value: "CS" },
    });
    fireEvent.change(screen.getByLabelText("Työnimike:"), {
      target: { value: "Testaaja" },
    });
    fireEvent.change(screen.getByLabelText("Esihenkilö(t):"), {
      target: { value: "Liisa Esihenkilö" },
    });
    fireEvent.change(screen.getByLabelText("Sopimusalku:"), {
      target: { value: "2025-01-01" },
    });
    fireEvent.change(screen.getByLabelText("Sopimusloppu:"), {
      target: { value: "2026-01-01" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining(REQUIRED_INITIAL),
      true,
    );
  });

  it("reports invalid when a required field is cleared", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Nimi:"), {
      target: { value: "" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "" }),
      false,
    );
  });

  it("reports invalid when a required field is only whitespace", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Nimi:"), {
      target: { value: "   " },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "   " }),
      false,
    );
  });

  it("optional fields do not affect validity", () => {
    render(<PersonForm {...defaultProps} initial={REQUIRED_INITIAL} />);
    fireEvent.change(screen.getByLabelText("Tutkimusryhmä:"), {
      target: { value: "Tutkimusryhmä A" },
    });
    fireEvent.change(screen.getByLabelText("Muut tiedot:"), {
      target: { value: "" },
    });
    expect(defaultProps.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ ...REQUIRED_INITIAL }),
      true,
    );
  });
});
