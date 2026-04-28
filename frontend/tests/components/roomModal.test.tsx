import RoomModal from "@components/RoomModal/RoomModal";
import { findAllDepartments } from "@services/referenceDataService.ts";
import "@testing-library/jest-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@services/referenceDataService", () => ({
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
    onSave: vi.fn(),
    onClose: vi.fn(),
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
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(screen.getByLabelText("Sulje huoneen tietojen muokkaus"));
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("shows confirmation when clicking outside the modal", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    const dialog = screen.getByText("Muokkaa huonetta").closest("dialog")!;
    await user.click(dialog);
    expect(screen.getByText("Sulje ilman tallennusta?")).toBeInTheDocument();
  });

  it("shows confirmation when clicking save", async () => {
    const user = userEvent.setup();
    await renderAndWait({ initial: INITIAL });
    await user.click(
      screen.getByText("Tallenna", { selector: ".room-modal-save-button" }),
    );
    expect(screen.getByText("Tallenna muutokset?")).toBeInTheDocument();
  });

  it("calls onSave with form data when confirming save", async () => {
    const user = userEvent.setup();
    await renderAndWait({ initial: INITIAL });
    await user.click(
      screen.getByText("Tallenna", { selector: ".room-modal-save-button" }),
    );
    const dialog = screen.getByText("Tallenna muutokset?").closest("dialog")!;
    await user.click(within(dialog).getByRole("button", { name: "Tallenna" }));
    expect(defaultProps.onSave).toHaveBeenCalledWith(INITIAL);
  });

  it("cancelling close confirmation does not close", async () => {
    const user = userEvent.setup();
    await renderAndWait();
    await user.click(
      screen.getByRole("button", { name: "Sulje huoneen tietojen muokkaus" }),
    );
    const confirmation = screen
      .getByText("Sulje ilman tallennusta?")
      .closest("dialog")!;
    await user.click(screen.getByText("Peruuta"));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(confirmation).not.toHaveAttribute("open");
  });

  it("cancelling save confirmation does not save or close", async () => {
    const user = userEvent.setup();
    await renderAndWait({ initial: INITIAL });
    await user.click(
      screen.getByText("Tallenna", { selector: ".room-modal-save-button" }),
    );
    const confirmation = screen
      .getByText("Tallenna muutokset?")
      .closest("dialog")!;
    await user.click(screen.getByText("Peruuta"));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
    expect(defaultProps.onClose).not.toHaveBeenCalled();
    expect(confirmation).not.toHaveAttribute("open");
  });
});
