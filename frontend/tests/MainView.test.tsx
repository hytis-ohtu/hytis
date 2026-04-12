import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MainView from "../src/components/MainView.tsx";
import { RoomSelectionProvider } from "../src/contexts/RoomSelectionContext";
import {
  DEFAULT_SCALE,
  getBottomBound,
  getLeftBound,
  getRightBound,
  getTopBound,
  MAX_ZOOM,
  MIN_ZOOM,
  MOVE_THRESHOLD,
} from "../src/hooks/useMapTransform.ts";
import {
  AvailabilityColors,
  getDepartmentColor,
} from "../src/hooks/useRoomColors.ts";
import { findAllRooms, findRoomById } from "../src/services/roomsService";
import { rooms } from "./testData.ts";

vi.mock("../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

const customRender = (ui: React.ReactElement) => {
  return render(
    <RoomSelectionProvider fetchRoomById={vi.fn()}>
      {ui}
    </RoomSelectionProvider>
  );
};

vi.mock("../src/assets/exactum-2.min.svg?react", () => ({
  default: (props: Record<string, unknown>) => (
    <svg {...props} data-testid="mock-svg">
      <path
        d="M1325.291-1106.835h-9.448v127.748h278.74v-330.33h-274.016v8.315h4.724v9.449h-4.724v175.37h4.724zm166.678-9.448h9.448v9.448h-9.448zm0-184.82h9.448v9.45h-9.448z"
        data-room="A210"
      />
      <path d="M1598.93-1309.417v144h145.322v-144z" data-room="A211" />
      <path
        d="M1750.866-1291.653h-2.835v126.236h96v-144h-98.834v8.315h5.67z"
        data-room="A212"
      />
    </svg>
  ),
}));

vi.mock("../src/services/roomsService");

describe("MainView", () => {
  it("renders without crashing", () => {
    vi.mocked(findAllRooms).mockResolvedValue([]);
    customRender(<MainView />);
    expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
  });

  it("maps rooms data correctly to SVG elements", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    customRender(<MainView />);

    await waitFor(() => {
      const availableRoom = document.querySelector(
        '[data-room="A210"]',
      ) as SVGGraphicsElement;
      expect(availableRoom).toHaveAttribute("id", "1");
      expect(availableRoom).toHaveClass("room");
      expect(availableRoom).toHaveStyle(
        `fill: ${AvailabilityColors["available"]}`,
      );

      const limitedRoom = document.querySelector(
        '[data-room="A211"]',
      ) as SVGGraphicsElement;
      expect(limitedRoom).toHaveAttribute("id", "2");
      expect(limitedRoom).toHaveClass("room");
      expect(limitedRoom).toHaveStyle(`fill: ${AvailabilityColors["limited"]}`);

      const fullRoom = document.querySelector(
        '[data-room="A212"]',
      ) as SVGGraphicsElement;
      expect(fullRoom).toHaveAttribute("id", "3");
      expect(fullRoom).toHaveClass("room");
      expect(fullRoom).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
    });
  });

  it("room colors change correctly when showing departments", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    customRender(<MainView />);

    const user = userEvent.setup();
    user.click(screen.getByTestId("switch-color-mode"));

    await waitFor(() => {
      const room = document.querySelector(
        '[data-room="A210"]',
      ) as SVGGraphicsElement;
      expect(room).toHaveStyle(
        `fill: ${getDepartmentColor(rooms[0].department.name)}`,
      );
    });
  });

  it("incorrect department name returns error color", () => {
    const value = getDepartmentColor("incorrect name");
    expect(value).toBe("#aaaaaa");
  });

  it("renders legend with correct initial mode (availability)", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    customRender(<MainView />);

    await waitFor(() => {
      const legend = screen.getByTestId("legend");
      expect(legend).toBeInTheDocument();
    });
  });

  it("legend switches to department mode when button is clicked", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    customRender(<MainView />);

    const user = userEvent.setup();

    // Initially in availability mode (useAvailability is true by default)
    await waitFor(() => {
      const legend = screen.getByTestId("legend");
      expect(legend).toBeInTheDocument();
    });

    // Click the button to switch to department mode
    await user.click(screen.getByTestId("switch-color-mode"));

    // Legend should still be rendered
    expect(screen.getByTestId("legend")).toBeInTheDocument();
  });
});

  it("fetches room details when a room is clicked", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    vi.mocked(findRoomById).mockResolvedValue(rooms[0]);
    customRender(<MainView />);

    await waitFor(() => {
      const room = document.querySelector('[data-room="A210"]');
      expect(room).toHaveAttribute("id", "1");
    });

    const room = document.querySelector('[data-room="A210"]');
    expect(room).toBeTruthy();

    if (room instanceof SVGElement) {
      fireEvent.click(room);
    }

    await waitFor(() => {
      expect(findRoomById).toHaveBeenCalledWith("1");
    });
  });

describe("MapTransform", () => {
  describe("transform with buttons", () => {
    it("zoom buttons work", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      const map = document.getElementsByClassName(
        "map-container",
      )[0] as HTMLDivElement;

      expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

      await user.click(screen.getByTestId("zoom-increase-button"));

      expect(Number(map.style.scale)).toBeGreaterThan(DEFAULT_SCALE);

      await user.click(screen.getByTestId("reset-transform-button"));

      expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

      await user.click(screen.getByTestId("zoom-decrease-button"));

      expect(Number(map.style.scale)).toBeLessThan(DEFAULT_SCALE);
    });

    it("zooming with button stops at maximum", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      const map = document.getElementsByClassName(
        "map-container",
      )[0] as HTMLDivElement;

      expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

      while (Number(map.style.scale) !== MAX_ZOOM) {
        await user.click(screen.getByTestId("zoom-increase-button"));
      }

      await user.click(screen.getByTestId("zoom-increase-button"));

      expect(Number(map.style.scale)).toBe(MAX_ZOOM);
    });

    it("zooming with button stops at minimum", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      const map = document.getElementsByClassName(
        "map-container",
      )[0] as HTMLDivElement;

      expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

      while (Number(map.style.scale) !== MIN_ZOOM) {
        await user.click(screen.getByTestId("zoom-decrease-button"));
      }

      await user.click(screen.getByTestId("zoom-decrease-button"));

      expect(Number(map.style.scale)).toBe(MIN_ZOOM);
    });

    it("while zooming with buttons the map is bounded from the left and top", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      const inputDiv = document.getElementsByClassName(
        "click-container",
      )[0] as HTMLDivElement;
      const map = document.getElementsByClassName(
        "map-container",
      )[0] as HTMLDivElement;

      const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
        clientX: 10000,
        clientY: 10000,
      });
      const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
        clientX: 0,
        clientY: 0,
      });
      const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
        clientX: 10000,
        clientY: 10000,
      });

      inputDiv.dispatchEvent(mouseDownEvent);
      inputDiv.dispatchEvent(mouseMoveEvent);
      inputDiv.dispatchEvent(mouseUpEvent);
      await user.click(screen.getByTestId("zoom-decrease-button"));

      expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
      expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
    });

    it("while zooming with buttons the map is bounded from the right and bottom", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      const inputDiv = document.getElementsByClassName(
        "click-container",
      )[0] as HTMLDivElement;
      const map = document.getElementsByClassName(
        "map-container",
      )[0] as HTMLDivElement;

      const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
        clientX: -10000,
        clientY: -10000,
      });
      const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
        clientX: 0,
        clientY: 0,
      });
      const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
        clientX: -10000,
        clientY: -10000,
      });

      inputDiv.dispatchEvent(mouseDownEvent);
      inputDiv.dispatchEvent(mouseMoveEvent);
      inputDiv.dispatchEvent(mouseUpEvent);
      await user.click(screen.getByTestId("zoom-decrease-button"));

      const scale = Number(map.style.scale);

      expect(Number(map.style.left.replace("px", ""))).toBe(
        getRightBound() - window.innerWidth * scale,
      );
      expect(Number(map.style.top.replace("px", ""))).toBe(
        getBottomBound() - window.innerHeight * scale,
      );
    });
  });

  describe("transform with mouse", () => {
    describe("zooming", () => {
      it("zooming in increases scale", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomInEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
        });

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        inputDiv.dispatchEvent(mouseZoomInEvent);

        expect(Number(map.style.scale)).toBeGreaterThan(DEFAULT_SCALE);
      });

      it("zooming out decreases scale", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: 10,
        });

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        inputDiv.dispatchEvent(mouseZoomOutEvent);

        expect(Number(map.style.scale)).toBeLessThan(DEFAULT_SCALE);
      });

      it("zooming stops at maximum", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomInEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
        });

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        while (Number(map.style.scale) !== MAX_ZOOM) {
          inputDiv.dispatchEvent(mouseZoomInEvent);
        }

        inputDiv.dispatchEvent(mouseZoomInEvent);

        expect(Number(map.style.scale)).toBe(MAX_ZOOM);
      });

      it("zooming stops at minimum", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: 10,
        });

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        while (Number(map.style.scale) !== MIN_ZOOM) {
          inputDiv.dispatchEvent(mouseZoomOutEvent);
        }

        inputDiv.dispatchEvent(mouseZoomOutEvent);

        expect(Number(map.style.scale)).toBe(MIN_ZOOM);
      });

      it("zooming in moves the map outward", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomInEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        });

        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseZoomInEvent);

        expect(Number(map.style.left.replace("px", ""))).toBeLessThan(0);
        expect(Number(map.style.top.replace("px", ""))).toBeLessThan(0);
      });

      it("zooming out moves the map inward", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: 10,
          clientX: window.innerWidth / 2,
          clientY: window.innerHeight / 2,
        });

        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseZoomOutEvent);

        expect(Number(map.style.left.replace("px", ""))).toBeGreaterThan(0);
        expect(Number(map.style.top.replace("px", ""))).toBeGreaterThan(0);
      });

      it("while zooming the map is bounded from the left and top", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: 10000,
          clientY: 10000,
        });
        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: 10000,
          clientY: 10000,
        });
        const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
          clientX: 0,
          clientY: 0,
        });

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseMoveEvent);
        inputDiv.dispatchEvent(mouseUpEvent);
        inputDiv.dispatchEvent(mouseZoomEvent);

        expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
        expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
      });

      it("while zooming the map is bounded from the right and bottom", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: -10000,
          clientY: -10000,
        });
        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: -10000,
          clientY: -10000,
        });
        const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
          deltaY: -10,
          clientX: window.innerWidth,
          clientY: window.innerHeight,
        });

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseMoveEvent);
        inputDiv.dispatchEvent(mouseUpEvent);
        inputDiv.dispatchEvent(mouseZoomEvent);

        const scale = Number(map.style.scale);

        expect(Number(map.style.left.replace("px", ""))).toBe(
          getRightBound() - window.innerWidth * scale,
        );
        expect(Number(map.style.top.replace("px", ""))).toBe(
          getBottomBound() - window.innerHeight * scale,
        );
      });
    });

    describe("moving", () => {
      it("moving map works", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: 100,
          clientY: 100,
        });
        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: 100,
          clientY: 100,
        });

        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseMoveEvent);

        // map shouldn't move
        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseMoveEvent);
        inputDiv.dispatchEvent(mouseUpEvent);

        // map should move
        expect(Number(map.style.left.replace("px", ""))).toBeGreaterThan(0);
        expect(Number(map.style.top.replace("px", ""))).toBeGreaterThan(0);
      });

      it("moving is bounded from the left and top", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: 10000,
          clientY: 10000,
        });
        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: 10000,
          clientY: 10000,
        });

        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseMoveEvent);
        inputDiv.dispatchEvent(mouseUpEvent);

        expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
        expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
      });

      it("moving is bounded from the right and bottom", () => {
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        const mouseMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: -10000,
          clientY: -10000,
        });
        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: -10000,
          clientY: -10000,
        });

        expect(map.style.left).toBe("0px");
        expect(map.style.top).toBe("0px");

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseMoveEvent);
        inputDiv.dispatchEvent(mouseUpEvent);

        const scale = Number(map.style.scale);

        expect(Number(map.style.left.replace("px", ""))).toBe(
          getRightBound() - window.innerWidth * scale,
        );
        expect(Number(map.style.top.replace("px", ""))).toBe(
          getBottomBound() - window.innerHeight * scale,
        );
      });

      it("moving the map disables room hovering", async () => {
        vi.mocked(findAllRooms).mockResolvedValue(rooms);
        customRender(<MainView />);

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;

        const mouseDownEvent: MouseEvent = new MouseEvent("mousedown", {
          clientX: 0,
          clientY: 0,
        });
        const mouseLargeMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: MOVE_THRESHOLD + 1,
          clientY: 0,
        });
        const mouseLargeUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: MOVE_THRESHOLD + 1,
          clientY: 0,
        });
        const mouseSmallMoveEvent: MouseEvent = new MouseEvent("mousemove", {
          clientX: MOVE_THRESHOLD - 1,
          clientY: 0,
        });
        const mouseSmallUpEvent: MouseEvent = new MouseEvent("mouseup", {
          clientX: MOVE_THRESHOLD - 1,
          clientY: 0,
        });

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseLargeMoveEvent);

        await waitFor(() => {
          const room = document.querySelector(
            '[data-room="A210"]',
          ) as SVGGraphicsElement;
          expect(room).toHaveStyle("pointer-events: none");
        });

        inputDiv.dispatchEvent(mouseLargeUpEvent);

        await waitFor(() => {
          const room = document.querySelector(
            '[data-room="A210"]',
          ) as SVGGraphicsElement;
          expect(room).toHaveStyle("pointer-events: all");
        });

        inputDiv.dispatchEvent(mouseDownEvent);
        inputDiv.dispatchEvent(mouseSmallMoveEvent);

        await waitFor(() => {
          const room = document.querySelector(
            '[data-room="A210"]',
          ) as SVGGraphicsElement;
          expect(room).toHaveStyle("pointer-events: all");
        });

        inputDiv.dispatchEvent(mouseSmallUpEvent);

        await waitFor(() => {
          const room = document.querySelector(
            '[data-room="A210"]',
          ) as SVGGraphicsElement;
          expect(room).toHaveStyle("pointer-events: all");
        });
      });
    });
  });
});
