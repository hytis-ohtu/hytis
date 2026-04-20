import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RoomSelectionProvider } from "../../src/components/RoomSelectionProvider";
import { useRoomSelection } from "../../src/hooks/useRoomSelection";
import type { Room } from "../../src/types";

const mockRoom: Room = {
  id: 1,
  name: "A210",
  area: "63.6",
  capacity: 15,
  contracts: [],
  department: {
    id: 2,
    name: "H523 CS",
  },
  freeText: "Test room",
  roomType: { id: 1, name: "Office" },
};

const mockFetchRoomById = vi.fn();

describe("RoomSelectionProvider", () => {
  it("provides context values to children", () => {
    function TestComponent() {
      const context = useRoomSelection();

      return (
        <div>
          <span data-testid="active-room-id">
            {context.activeRoomId ?? "null"}
          </span>
          <span data-testid="is-side-panel-open">
            {String(context.isSidePanelOpen)}
          </span>
          <span data-testid="selected-person-id">
            {context.selectedPersonId ?? "null"}
          </span>
        </div>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("null");
    expect(screen.getByTestId("is-side-panel-open")).toHaveTextContent("false");
    expect(screen.getByTestId("selected-person-id")).toHaveTextContent("null");
  });

  it("selectRoom function updates context values", async () => {
    mockFetchRoomById.mockResolvedValue(mockRoom);

    function TestComponent() {
      const context = useRoomSelection();

      return (
        <div>
          <span data-testid="active-room-id">
            {context.activeRoomId ?? "null"}
          </span>
          <span data-testid="is-side-panel-open">
            {String(context.isSidePanelOpen)}
          </span>
          <span data-testid="selected-person-id">
            {context.selectedPersonId ?? "null"}
          </span>
          <button
            onClick={() => context.selectRoom("1", 123)}
            data-testid="select-room"
          >
            Select Room
          </button>
        </div>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    const selectButton = screen.getByTestId("select-room");
    await selectButton.click();

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("1");
    expect(screen.getByTestId("is-side-panel-open")).toHaveTextContent("true");
    expect(screen.getByTestId("selected-person-id")).toHaveTextContent("123");
    expect(mockFetchRoomById).toHaveBeenCalledWith("1");
  });

  it("selectRoom without personId sets selectedPersonId to null", async () => {
    mockFetchRoomById.mockResolvedValue(mockRoom);

    function TestComponent() {
      const context = useRoomSelection();

      return (
        <div>
          <span data-testid="selected-person-id">
            {context.selectedPersonId ?? "null"}
          </span>
          <button
            onClick={() => context.selectRoom("1")}
            data-testid="select-room"
          >
            Select Room
          </button>
        </div>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    const selectButton = screen.getByTestId("select-room");
    await selectButton.click();

    expect(screen.getByTestId("selected-person-id")).toHaveTextContent("null");
  });

  it("selectRoom handles errors gracefully", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockFetchRoomById.mockRejectedValue(new Error("Failed to fetch"));

    function TestComponent() {
      const context = useRoomSelection();

      return (
        <button
          onClick={() => context.selectRoom("1")}
          data-testid="select-room"
        >
          Select Room
        </button>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    const selectButton = screen.getByTestId("select-room");
    await selectButton.click();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "❌ Failed to fetch room details:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });

  it("setters update context values", async () => {
    function TestComponent() {
      const context = useRoomSelection();

      return (
        <div>
          <span data-testid="active-room-id">
            {context.activeRoomId ?? "null"}
          </span>
          <span data-testid="is-side-panel-open">
            {String(context.isSidePanelOpen)}
          </span>
          <button
            onClick={() => {
              context.setActiveRoomId("999");
              context.setIsSidePanelOpen(true);
            }}
            data-testid="set-values"
          >
            Set Values
          </button>
        </div>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    const setButton = screen.getByTestId("set-values");
    setButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("999");
      expect(screen.getByTestId("is-side-panel-open")).toHaveTextContent(
        "true",
      );
    });
  });

  it("setRoom updates room value", async () => {
    function TestComponent() {
      const context = useRoomSelection();

      return (
        <div>
          <span data-testid="room-name">{context.room?.name ?? "null"}</span>
          <button
            onClick={() => context.setRoom(mockRoom)}
            data-testid="set-room"
          >
            Set Room
          </button>
        </div>
      );
    }

    render(
      <RoomSelectionProvider fetchRoomById={mockFetchRoomById}>
        <TestComponent />
      </RoomSelectionProvider>,
    );

    const setButton = screen.getByTestId("set-room");
    setButton.click();

    await waitFor(() => {
      expect(screen.getByTestId("room-name")).toHaveTextContent("A210");
    });
  });
});

describe("useRoomSelection", () => {
  it("throws error when used outside RoomSelectionProvider", () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    function TestComponent() {
      useRoomSelection();
      return <div>Test</div>;
    }

    expect(() => {
      render(<TestComponent />);
    }).toThrow("useRoomSelection must be used within RoomSelectionProvider");

    consoleErrorSpy.mockRestore();
  });
});
