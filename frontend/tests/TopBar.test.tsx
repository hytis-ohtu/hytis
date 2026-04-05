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

describe("TopBar", () => {
  it("renders the title correctly", () => {
    render(<TopBar />);
    expect(screen.getByText("HYTiS")).toBeInTheDocument();
  });

  it("topbar menu can be opened", async () => {
    const user = userEvent.setup();
    render(<TopBar />);
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
