import "@testing-library/jest-dom";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RoomModal from "../../src/components/RoomModal/RoomModal.tsx";
import { findAllDepartments } from "../../src/services/referenceDataService.ts";

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

describe("RoomModal", () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    initial: {},
  };

  const renderAndWait = async (
    props: Partial<typeof defaultProps> & {
      initial?: Record<string, string>;
    } = {},
  ) => {
    render(<RoomModal {...defaultProps} {...props} />);
    await waitFor(() => expect(findAllDepartments).toHaveBeenCalled());
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    await renderAndWait();
    expect(screen.getByText("Muokkaa huonetta")).toBeInTheDocument();
  });

  it("save button is disabled when required fields are empty", async () => {
    await renderAndWait();
    expect(screen.getByText("Tallenna")).toBeDisabled();
  });

  it("save button is enabled when required fields are filled", async () => {
    await renderAndWait({ initial: INITIAL });
    await waitFor(() => expect(screen.getByText("Tallenna")).toBeEnabled());
  });

  it("renders with initial values pre-filled", async () => {
    await renderAndWait({ initial: INITIAL });
    expect(screen.getByDisplayValue("10")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Konferenssihuone")).toBeInTheDocument();
  });

  it("shows confirmation when clicking close button", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByLabelText("Sulje"));
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("shows confirmation when clicking outside the modal", async () => {
    await renderAndWait();
    const overlay = screen
      .getByText("Muokkaa huonetta")
      .closest(".roommodal-content")!.parentElement!;
    fireEvent.click(overlay);
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("shows confirmation when clicking save", async () => {
    await renderAndWait({ initial: INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    expect(screen.getByText("Tallenna muutokset?")).toBeInTheDocument();
  });

  it("calls onSubmit with form data when confirming save", async () => {
    await renderAndWait({ initial: INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    const dialog = screen.getByText("Tallenna muutokset?").closest("div")!;
    fireEvent.click(within(dialog).getByRole("button", { name: "Tallenna" }));
    expect(defaultProps.onSubmit).toHaveBeenCalledWith(INITIAL);
  });

  it("calls onClose when confirming close", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByLabelText("Sulje"));
    fireEvent.click(screen.getByText("Kyllä"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("cancelling close confirmation does not close", async () => {
    await renderAndWait();
    fireEvent.click(screen.getByLabelText("Sulje"));
    fireEvent.click(screen.getByText("Peruuta"));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(
      screen.queryByText("Sulje ilman tallennusta?"),
    ).not.toBeInTheDocument();
  });

  it("cancelling save confirmation does not save or close", async () => {
    await renderAndWait({ initial: INITIAL });
    fireEvent.click(screen.getByText("Tallenna"));
    fireEvent.click(screen.getByText("Peruuta"));
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Tallenna muutokset?")).not.toBeInTheDocument();
  });

  it("clicking inside the modal does not trigger close confirmation", async () => {
    await renderAndWait();
    const content = screen
      .getByText("Muokkaa huonetta")
      .closest(".roommodal-content")!;
    fireEvent.click(content);
    expect(
      screen.queryByText("Sulje ilman tallennusta?"),
    ).not.toBeInTheDocument();
  });
});
