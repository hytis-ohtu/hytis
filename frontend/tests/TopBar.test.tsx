import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TopBar from "../src/components/TopBar.tsx";

vi.mock("../src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("../src/hooks/useRoomSelection", () => ({
  useRoomSelection: () => ({
    activeRoomId: null,
    setActiveRoomId: vi.fn(),
    isSidePanelOpen: false,
    setIsSidePanelOpen: vi.fn(),
    room: null,
    setRoom: vi.fn(),
    selectRoom: vi.fn(),
    selectedPersonId: null,
  }),
}));

const customRender = (ui: React.ReactElement) => {
  return render(ui);
};

describe("TopBar", () => {
  it("renders the title correctly", () => {
    customRender(<TopBar />);
    expect(screen.getByText("HYTiS")).toBeInTheDocument();
  });

  it("topbar menu can be opened", async () => {
    const user = userEvent.setup();
    customRender(<TopBar />);
    const menuButton = screen.getByTestId("topbar-profile-button");

    expect(
      screen.queryByTestId("topbar-settings-button"),
    ).not.toBeInTheDocument();

    await user.click(menuButton);
    expect(screen.getByTestId("topbar-settings-button")).toBeInTheDocument();

    await user.click(document.body);
    await waitFor(() => {
      expect(
        screen.queryByTestId("topbar-settings-button"),
      ).not.toBeInTheDocument();
    });
  });
});
