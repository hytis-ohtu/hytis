import SettingsModal from "@components/TopBar/SettingsModal/SettingsModal";
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("SettingsModal", () => {
  const mockOnClose = vi.fn();
  const mockSetFontSize = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockSetFontSize.mockClear();
  });

  it("renders without crashing", () => {
    render(
      <SettingsModal onClose={() => {}} fontSize={16} setFontSize={() => {}} />,
    );
    expect(screen.getByText("Asetukset")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", async () => {
    render(
      <SettingsModal
        onClose={mockOnClose}
        fontSize={24}
        setFontSize={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("displays the correct font size", () => {
    render(
      <SettingsModal onClose={() => {}} fontSize={18} setFontSize={() => {}} />,
    );
    expect(
      screen.getByText("Kartan tekstin fonttikoko: 18px"),
    ).toBeInTheDocument();
  });

  it("calls setFontSize when the range input value changes", () => {
    render(
      <SettingsModal
        onClose={() => {}}
        fontSize={16}
        setFontSize={mockSetFontSize}
      />,
    );
    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "20" } });
    expect(mockSetFontSize).toHaveBeenCalledWith(20);
  });

  it("updates localStorage and CSS variable when font size changes", () => {
    const setItemSpy = vi
      .spyOn(localStorage, "setItem")
      .mockImplementation(() => undefined);

    render(
      <SettingsModal
        onClose={() => {}}
        fontSize={16}
        setFontSize={mockSetFontSize}
      />,
    );
    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "22" } });

    expect(setItemSpy).toHaveBeenCalledWith("map-font-size", "22");
    setItemSpy.mockRestore();
    expect(
      document.documentElement.style.getPropertyValue("--map-font-size"),
    ).toBe("22px");
  });
});
