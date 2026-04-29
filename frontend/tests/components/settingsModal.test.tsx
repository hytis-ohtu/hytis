import SettingsModal from "@components/TopBar/SettingsModal/SettingsModal";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("SettingsModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  afterEach(() => {
    localStorage.removeItem("font-size-map");
    document.documentElement.style.removeProperty("--font-size-map");
  });

  it("renders without crashing", () => {
    render(<SettingsModal onClose={() => {}} />);
    expect(
      screen.getByRole("heading", { name: "Asetukset" }),
    ).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    render(<SettingsModal onClose={mockOnClose} />);
    await user.click(screen.getByRole("button", { name: "Sulje asetukset" }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays the correct font size", () => {
    const getItemSpy = vi
      .spyOn(localStorage, "getItem")
      .mockImplementation((key) => (key === "font-size-map" ? "18" : null));
    render(<SettingsModal onClose={() => {}} />);
    expect(screen.getByText(/Kartan tekstin fonttikoko:/i)).toHaveTextContent(
      "18",
    );
    getItemSpy.mockRestore();
  });

  it("updates the label when the range input value changes", () => {
    render(<SettingsModal onClose={() => {}} />);
    const rangeInput = screen.getByRole("slider", {
      name: /Kartan tekstin fonttikoko:/i,
    });
    fireEvent.change(rangeInput, { target: { value: "20" } });
    expect(screen.getByText(/Kartan tekstin fonttikoko:/i)).toHaveTextContent(
      "20",
    );
  });

  it("updates localStorage and CSS variable when font size changes", () => {
    const setItemSpy = vi
      .spyOn(localStorage, "setItem")
      .mockImplementation(() => undefined);

    render(<SettingsModal onClose={() => {}} />);
    const rangeInput = screen.getByRole("slider", {
      name: /Kartan tekstin fonttikoko:/i,
    });
    fireEvent.change(rangeInput, { target: { value: "22" } });

    expect(setItemSpy).toHaveBeenCalledWith("font-size-map", "22");
    setItemSpy.mockRestore();
    expect(
      document.documentElement.style.getPropertyValue("--font-size-map"),
    ).toBe("22px");
  });
});
