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
    render(<TopBar />);

    const user = userEvent.setup();

    expect(
      screen.queryByRole("heading", { name: "Asetukset" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Asetukset" }));

    expect(
      screen.queryByRole("heading", { name: "Asetukset" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sulje asetukset" }));

    expect(
      screen.queryByRole("heading", { name: "Asetukset" }),
    ).not.toBeInTheDocument();
  });

  it("topbar menu can be opened", async () => {
    render(<TopBar />);

    const user = userEvent.setup();

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: "Käyttäjä" });

    await user.click(menuButton);

    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });
  });
});
