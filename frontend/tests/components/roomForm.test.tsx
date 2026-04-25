import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RoomForm from "../../src/components/RoomModal/RoomForm/RoomForm";

vi.mock("../../src/services/referenceDataService", () => ({
  findAllDepartments: vi.fn().mockResolvedValue([
    { id: 1, name: "IT" },
    { id: 2, name: "HR" },
  ]),
  findAllRoomTypes: vi.fn().mockResolvedValue([
    { id: 1, name: "Konferenssihuone" },
    { id: 2, name: "Työhuone" },
  ]),
}));

const INITIAL = {
  capacity: "10",
  roomType: "1",
  department: "1",
  freeText: "Lisätietoja",
};

describe("RoomForm", () => {
  const defaultProps = {
    onChange: vi.fn(),
    initial: {},
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    render(<RoomForm {...defaultProps} />);
    expect(screen.getByLabelText("Kapasiteetti:")).toBeInTheDocument();
  });

  it("renders all fields", () => {
    render(<RoomForm {...defaultProps} />);
    expect(screen.getByLabelText("Kapasiteetti:")).toBeInTheDocument();
    expect(screen.getByLabelText("Huonetyyppi:")).toBeInTheDocument();
    expect(screen.getByLabelText("Osasto:")).toBeInTheDocument();
    expect(screen.getByLabelText("Lisätiedot:")).toBeInTheDocument();
  });

  it("renders with empty fields by default", () => {
    render(<RoomForm {...defaultProps} />);
    expect(screen.getByLabelText("Kapasiteetti:")).toHaveValue(null);
    expect(screen.getByLabelText("Huonetyyppi:")).toHaveValue("");
    expect(screen.getByLabelText("Osasto:")).toHaveValue("");
  });

  it("renders with initial values pre-filled", async () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    await waitFor(() => {
      expect(
        screen.getByRole("option", { name: "Konferenssihuone" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Konferenssihuone")).toBeInTheDocument();
    expect(screen.getByDisplayValue("IT")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Lisätietoja")).toBeInTheDocument();
  });

  it("calls onChange on mount with initial values", () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith(INITIAL, true);
  });

  it("calls onChange on mount with empty values", () => {
    render(<RoomForm {...defaultProps} />);
    expect(defaultProps.onChange).toHaveBeenCalledWith({}, false);
  });

  it("calls onChange with updated value when capacity changes", () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    fireEvent.change(screen.getByLabelText("Kapasiteetti:"), {
      target: { value: "20" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ capacity: "20" }),
      true,
    );
  });

  it("calls onChange with updated value when roomType changes", async () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    await waitFor(() =>
      expect(
        screen.getByRole("option", { name: "Konferenssihuone" }),
      ).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Huonetyyppi:"), {
      target: { value: "2" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ roomType: "2" }),
      true,
    );
  });

  it("calls onChange with updated value when freeText changes", () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    fireEvent.change(screen.getByLabelText("Lisätiedot:"), {
      target: { value: "Uusi teksti" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ freeText: "Uusi teksti" }),
      true,
    );
  });

  it("renders fetched department options in dropdown", async () => {
    render(<RoomForm {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "HR" })).toBeInTheDocument();
    });
  });

  it("calls onChange with updated department when select changes", async () => {
    render(<RoomForm {...defaultProps} initial={INITIAL} />);
    await waitFor(() =>
      expect(screen.getByRole("option", { name: "HR" })).toBeInTheDocument(),
    );
    fireEvent.change(screen.getByLabelText("Osasto:"), {
      target: { value: "2" },
    });
    expect(defaultProps.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ department: "2" }),
      true,
    );
  });
});
