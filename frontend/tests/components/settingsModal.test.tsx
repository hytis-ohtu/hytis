import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SettingsModal from "../../src/components/SettingsModal.tsx";

describe("SettingsModal", () => {
  const onCloseMock = vi.fn();
  const setFontSizeMock = vi.fn();

  beforeEach(() => {
    onCloseMock.mockClear();
    setFontSizeMock.mockClear();
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
        onClose={onCloseMock}
        fontSize={24}
        setFontSize={() => {}}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it("displays the correct font size", () => {
    render(
      <SettingsModal onClose={() => {}} fontSize={18} setFontSize={() => {}} />,
    );
    expect(
      screen.getByText("Kartan tekstin fonttikoko: 18px"),
    ).toBeInTheDocument();
  });

  it("calls setFontSize when the range input value changes", async () => {
    render(
      <SettingsModal
        onClose={() => {}}
        fontSize={16}
        setFontSize={setFontSizeMock}
      />,
    );
    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "20" } });
    expect(setFontSizeMock).toHaveBeenCalledWith(20);
  });

  it("updates localStorage and CSS variable when font size changes", async () => {
    render(
      <SettingsModal
        onClose={() => {}}
        fontSize={16}
        setFontSize={setFontSizeMock}
      />,
    );
    const rangeInput = screen.getByRole("slider");
    fireEvent.change(rangeInput, { target: { value: "22" } });

    expect(localStorage.setItem).toHaveBeenCalledWith("map-font-size", "22");
    expect(
      document.documentElement.style.getPropertyValue("--map-font-size"),
    ).toBe("22px");
  });
});
