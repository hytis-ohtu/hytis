import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TopBar from "../../src/components/TopBar.tsx";

vi.mock("../../src/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("../../src/hooks/useRoomSelection", () => ({
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

describe("TopBar", () => {
  it("renders the title correctly", () => {
    render(<TopBar />);
    expect(screen.getByText("HYTiS")).toBeInTheDocument();
  });

  it("opens and closes settings modal from the settings button", async () => {
    const user = userEvent.setup();
    render(<TopBar />);

    expect(
      screen.queryByTestId("settings-modal-title"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByTestId("topbar-settings-button"));
    expect(screen.getByTestId("settings-modal-title")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "close" }));
    await waitFor(() => {
      expect(
        screen.queryByTestId("settings-modal-title"),
      ).not.toBeInTheDocument();
    });
  });

  it("topbar menu can be opened", async () => {
    const user = userEvent.setup();
    render(<TopBar />);
    const menuButton = screen.getByTestId("topbar-profile-button");

    expect(
      screen.queryByTestId("profile-menu-close-button"),
    ).not.toBeInTheDocument();

    await user.click(menuButton);
    expect(screen.getByTestId("profile-menu-close-button")).toBeInTheDocument();

    await user.click(document.body);
    await waitFor(() => {
      expect(
        screen.queryByTestId("profile-menu-close-button"),
      ).not.toBeInTheDocument();
    });
  });
});
