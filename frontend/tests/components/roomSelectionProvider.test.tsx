import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { RoomSelectionProvider } from "../../src/components/RoomSelectionProvider";
import { useRoomSelection } from "../../src/hooks/useRoomSelection";
import { findRoomById } from "../../src/services/roomsService";
import type { Room } from "../../src/types";
import { testRooms } from "../testData";

vi.mock("../../src/services/roomsService", () => ({
  findRoomById: vi.fn(),
}));

vi.mocked(findRoomById).mockResolvedValue(testRooms[0] as Room);

function deferred<T>() {
  let resolve!: (value: T) => void;

  const promise = new Promise<T>((res) => {
    resolve = res;
  });

  return { promise, resolve };
}

const customRender = (
  ui: ReactElement,
  mockFindRoomById = vi.mocked(findRoomById),
) => {
  const view = render(
    <RoomSelectionProvider findRoomById={mockFindRoomById}>
      {ui}
    </RoomSelectionProvider>,
  );

  return {
    ...view,
    mockFindRoomById,
  };
};

function TestDisplay() {
  const { activeRoom, activeRoomId, expandReq } = useRoomSelection();

  return (
    <div>
      <span data-testid="active-room-id">{activeRoomId ?? "null"}</span>
      <span data-testid="active-room-state">
        {activeRoom === undefined
          ? "undefined"
          : activeRoom === null
            ? "null"
            : String(activeRoom.id)}
      </span>
      <span data-testid="active-room-name">{activeRoom?.name ?? "null"}</span>
      <span data-testid="expand-req-id">{expandReq?.reqId ?? "null"}</span>
      <span data-testid="expand-req-person-id">
        {expandReq?.personId ?? "null"}
      </span>
    </div>
  );
}

interface TestButtonProps {
  testId: string;
  roomId: number | null;
  personId?: number | null;
  refresh?: boolean;
}

function TestButton({ testId, roomId, personId, refresh }: TestButtonProps) {
  const { selectRoom } = useRoomSelection();

  return (
    <button
      data-testid={testId}
      onClick={() => {
        void selectRoom(roomId, personId, refresh);
      }}
    >
      {testId}
    </button>
  );
}

function TestComponent() {
  return (
    <>
      <TestDisplay />
      <TestButton testId="open-room-1" roomId={1} />
      <TestButton testId="open-room-2" roomId={2} />
      <TestButton testId="open-room-1-person-123" roomId={1} personId={123} />
      <TestButton testId="open-room-1-person-456" roomId={1} personId={456} />
      <TestButton
        testId="reopen-room-1-no-refresh"
        roomId={1}
        refresh={false}
      />
      <TestButton testId="close-room" roomId={null} />
    </>
  );
}

describe("RoomSelectionProvider", () => {
  it("provides default context values", () => {
    customRender(<TestComponent />);

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("null");
    expect(screen.getByTestId("active-room-state")).toHaveTextContent("null");
    expect(screen.getByTestId("active-room-name")).toHaveTextContent("null");
    expect(screen.getByTestId("expand-req-id")).toHaveTextContent("null");
    expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
      "null",
    );
  });

  it("provides context values to children", async () => {
    const user = userEvent.setup();

    customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1"));

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("1");

    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
      expect(screen.getByTestId("active-room-name")).toHaveTextContent("A210");
    });
  });

  it("sets loading state before room fetch resolves", async () => {
    const user = userEvent.setup();

    const roomRequest = deferred<Room>();
    const mockFindRoomById = vi.fn(() => roomRequest.promise);

    customRender(<TestComponent />, mockFindRoomById);

    await user.click(screen.getByTestId("open-room-1"));

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("1");
    expect(screen.getByTestId("active-room-state")).toHaveTextContent(
      "undefined",
    );

    await act(async () => {
      roomRequest.resolve(testRooms[0] as Room);
      await roomRequest.promise;
    });

    expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
  });

  it("shows skeleton immediately when opening another room from closed panel", async () => {
    const user = userEvent.setup();
    const firstRequest = deferred<Room>();
    const secondRequest = deferred<Room>();
    const mockFindRoomById = vi
      .fn()
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise);

    customRender(<TestComponent />, mockFindRoomById);

    await user.click(screen.getByTestId("open-room-1"));
    await act(async () => {
      firstRequest.resolve(testRooms[0] as Room);
      await firstRequest.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
    });

    await user.click(screen.getByTestId("close-room"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("null");
    });

    await user.click(screen.getByTestId("open-room-2"));

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("2");
    expect(screen.getByTestId("active-room-state")).toHaveTextContent(
      "undefined",
    );

    await act(async () => {
      secondRequest.resolve(testRooms[1] as Room);
      await secondRequest.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("2");
    });
  });

  it("stores expand request when selecting room with person", async () => {
    const user = userEvent.setup();

    customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1-person-123"));

    await waitFor(() => {
      expect(screen.getByTestId("expand-req-id")).toHaveTextContent("1");
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "123",
      );
    });
  });

  it("clears expand request when selecting room without person", async () => {
    const user = userEvent.setup();

    customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1-person-123"));
    await waitFor(() => {
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "123",
      );
    });

    await user.click(screen.getByTestId("open-room-1"));
    await waitFor(() => {
      expect(screen.getByTestId("expand-req-id")).toHaveTextContent("null");
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "null",
      );
    });
  });

  it("closes side panel state when selecting null room", async () => {
    const user = userEvent.setup();

    customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1-person-123"));

    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("1");
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "123",
      );
    });

    await user.click(screen.getByTestId("close-room"));

    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("null");
      expect(screen.getByTestId("expand-req-id")).toHaveTextContent("null");
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "null",
      );
    });
  });

  it("reopens same room without refresh without triggering a fetch", async () => {
    const user = userEvent.setup();
    const { mockFindRoomById } = customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
    });

    await user.click(screen.getByTestId("close-room"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("null");
    });

    await user.click(screen.getByTestId("reopen-room-1-no-refresh"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("1");
    });

    expect(mockFindRoomById).toHaveBeenCalledTimes(1);
  });

  it("does not re-fetch when selecting same room with person id", async () => {
    const user = userEvent.setup();
    const { mockFindRoomById } = customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
    });

    await user.click(screen.getByTestId("open-room-1-person-456"));

    await waitFor(() => {
      expect(screen.getByTestId("expand-req-person-id")).toHaveTextContent(
        "456",
      );
    });

    expect(mockFindRoomById).toHaveBeenCalledTimes(1);
  });

  it("re-fetches same room when no person id is provided", async () => {
    const user = userEvent.setup();
    const { mockFindRoomById } = customRender(<TestComponent />);

    await user.click(screen.getByTestId("open-room-1"));
    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("1");
    });

    await user.click(screen.getByTestId("open-room-1"));

    await waitFor(() => {
      expect(mockFindRoomById).toHaveBeenCalledTimes(2);
    });
  });

  it("ignores stale requests and keeps latest room data", async () => {
    const user = userEvent.setup();
    const firstRequest = deferred<Room>();
    const secondRequest = deferred<Room>();
    const mockFindRoomById = vi
      .fn()
      .mockImplementationOnce(() => firstRequest.promise)
      .mockImplementationOnce(() => secondRequest.promise);

    customRender(<TestComponent />, mockFindRoomById);

    await user.click(screen.getByTestId("open-room-1"));
    await user.click(screen.getByTestId("open-room-2"));

    await act(async () => {
      secondRequest.resolve(testRooms[1] as Room);
      await secondRequest.promise;
    });

    await waitFor(() => {
      expect(screen.getByTestId("active-room-id")).toHaveTextContent("2");
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("2");
    });

    await act(async () => {
      firstRequest.resolve(testRooms[0] as Room);
      await firstRequest.promise;
    });

    expect(screen.getByTestId("active-room-id")).toHaveTextContent("2");
    expect(screen.getByTestId("active-room-state")).toHaveTextContent("2");
    expect(screen.getByTestId("active-room-name")).toHaveTextContent("A211");
  });

  it("selectRoom handles errors gracefully", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const mockFindRoomById = vi
      .mocked(findRoomById)
      .mockRejectedValue(new Error("Failed to fetch"));

    customRender(<TestComponent />, mockFindRoomById);
    await user.click(screen.getByTestId("open-room-1"));

    await waitFor(() => {
      expect(screen.getByTestId("active-room-state")).toHaveTextContent("null");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Failed to fetch room details:",
      expect.any(Error),
    );

    consoleErrorSpy.mockRestore();
  });
});

describe("useRoomSelection", () => {
  it("throws error when used outside RoomSelectionProvider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useRoomSelection must be used within RoomSelectionProvider");
  });
});
