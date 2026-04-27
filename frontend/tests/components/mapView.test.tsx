import MapView from "@components/MapView/MapView";
import { RoomSelectionProvider } from "@components/RoomSelectionProvider/RoomSelectionProvider";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SCALE,
  getBottomBound,
  getLeftBound,
  getRightBound,
  getTopBound,
  MAX_ZOOM,
  MIN_ZOOM,
  MOVE_THRESHOLD,
} from "../../src/hooks/useMapTransform.ts";
import {
  AvailabilityColors,
  getDepartmentColor,
} from "../../src/hooks/useRoomProperties.ts";
import { findAllRooms, findRoomById } from "../../src/services/roomsService.ts";
import { testRooms } from "../testData.ts";

vi.mock("../../src/services/roomsService", () => ({
  findAllRooms: vi.fn(),
  findRoomById: vi.fn(),
}));

vi.mocked(findAllRooms).mockResolvedValue(testRooms);
const mockFindRoomById = vi
  .mocked(findRoomById)
  .mockResolvedValue(testRooms[0]);

const customRender = (ui: ReactElement) => {
  return render(
    <RoomSelectionProvider findRoomById={mockFindRoomById}>
      {ui}
    </RoomSelectionProvider>,
  );
};

vi.mock("../../src/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    logout: vi.fn(),
  }),
}));

vi.mock("../../src/assets/exactum-2.min.svg?react", () => ({
  default: (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} data-testid="mock-svg">
      <path data-room="A210" data-testid="A210" />
      <path data-room="A211" data-testid="A211" />
      <path data-room="A212" data-testid="A212" />
    </svg>
  ),
}));

function mockElementGeometry(
  element: HTMLElement,
  width: number,
  height: number,
) {
  Object.defineProperties(element, {
    clientWidth: { value: width },
    clientHeight: { value: height },
    getBoundingClientRect: {
      value: () => ({
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: width,
        bottom: height,
        width,
        height,
        toJSON: () => ({}),
      }),
    },
  });
}

describe("MapView", () => {
  describe("initial render", () => {
    it("contains the map svg", () => {
      customRender(<MapView />);

      expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
    });

    it("maps room data correctly to SVG elements", async () => {
      customRender(<MapView />);

      const availableRoom = screen.getByTestId("A210");
      const limitedRoom = screen.getByTestId("A211");
      const fullRoom = screen.getByTestId("A212");

      // Wait for color mapping (which runs after room data mapping) to finish
      await waitFor(() => {
        expect(fullRoom).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
      });

      expect(availableRoom).toHaveAttribute("id", "1");
      expect(availableRoom).toHaveClass("room");
      expect(availableRoom).toHaveStyle(
        `fill: ${AvailabilityColors["available"]}`,
      );

      expect(limitedRoom).toHaveAttribute("id", "2");
      expect(limitedRoom).toHaveClass("room");
      expect(limitedRoom).toHaveStyle(`fill: ${AvailabilityColors["limited"]}`);

      expect(fullRoom).toHaveAttribute("id", "3");
      expect(fullRoom).toHaveClass("room");
    });
  });

  describe("map svg", () => {
    it("shows sidepanel when a room is clicked", async () => {
      customRender(<MapView />);

      const room = screen.getByTestId("A210");

      await waitFor(() => {
        expect(room).toHaveAttribute("id", "1");
      });

      await userEvent.click(room);

      expect(
        await screen.findByRole("heading", { name: /a210/i }),
      ).toBeInTheDocument();
    });
  });

  describe("map coloring", () => {
    it("is correct when showing availability", async () => {
      customRender(<MapView />);

      const room = document.querySelector(
        '[data-room="A210"]',
      ) as SVGGraphicsElement;

      await waitFor(() => {
        expect(room).toHaveStyle(`fill: ${AvailabilityColors["available"]}`);
      });
    });

    it("is correct when showing departments", async () => {
      customRender(<MapView />);

      const user = userEvent.setup();
      await user.click(screen.getByRole("button", { name: /vastuualueet/i }));

      const room = document.querySelector(
        '[data-room="A210"]',
      ) as SVGGraphicsElement;

      expect(room).toHaveStyle(
        `fill: ${getDepartmentColor(testRooms[0].department.name)}`,
      );
    });

    it("renders the legend", async () => {
      customRender(<MapView />);

      const legend = await screen.findByTestId("legend");

      expect(legend).toBeInTheDocument();
    });
  });

  describe("map transformation", () => {
    describe("zooming with buttons", () => {
      it("zooms in and out correctly", async () => {
        customRender(<MapView />);

        const inputContainer = screen.getByTestId("input-container");
        const mapContainer = screen.getByTestId("map-container");

        mockElementGeometry(inputContainer, 1000, 1000);
        mockElementGeometry(mapContainer, 1500, 1500);

        const user = userEvent.setup();

        expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(mapContainer.style.scale)).toBeGreaterThan(DEFAULT_SCALE);

        await user.click(screen.getByRole("button", { name: /loitonna/i }));
        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        expect(Number(mapContainer.style.scale)).toBeLessThan(DEFAULT_SCALE);
      });

      it("stops at maximum zoom level", async () => {
        customRender(<MapView />);

        const inputContainer = screen.getByTestId("input-container");
        const mapContainer = screen.getByTestId("map-container");

        mockElementGeometry(inputContainer, 1000, 1000);
        mockElementGeometry(mapContainer, 1500, 1500);

        const user = userEvent.setup();

        while (Number(mapContainer.style.scale) !== MAX_ZOOM) {
          await user.click(screen.getByRole("button", { name: /suurenna/i }));
        }

        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(mapContainer.style.scale)).toBe(MAX_ZOOM);
      });

      it("stops at minimum zoom level", async () => {
        customRender(<MapView />);

        const inputContainer = screen.getByTestId("input-container");
        const mapContainer = screen.getByTestId("map-container");

        mockElementGeometry(inputContainer, 1000, 1000);
        mockElementGeometry(mapContainer, 1500, 1500);

        const user = userEvent.setup();

        expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

        while (Number(mapContainer.style.scale) !== MIN_ZOOM) {
          await user.click(screen.getByRole("button", { name: /loitonna/i }));
        }

        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        expect(Number(mapContainer.style.scale)).toBe(MIN_ZOOM);
      });

      it("is bounded from top left", async () => {
        customRender(<MapView />);

        const inputContainer = screen.getByTestId("input-container");
        const mapContainer = screen.getByTestId("map-container");

        mockElementGeometry(inputContainer, 1000, 1000);
        mockElementGeometry(mapContainer, 1500, 1500);

        const user = userEvent.setup();

        await user.pointer([
          {
            target: inputContainer,
            coords: { x: 0, y: 0 },
            keys: "[MouseLeft>]",
          },
          { target: inputContainer, coords: { x: 10000, y: 10000 } },
          {
            target: inputContainer,
            coords: { x: 10000, y: 10000 },
            keys: "[/MouseLeft]",
          },
        ]);
        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
          getLeftBound(inputContainer.clientWidth),
        );
        expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
          getTopBound(inputContainer.clientHeight),
        );
      });

      it("bounds the map when zooming with buttons from bottom right", async () => {
        customRender(<MapView />);

        const inputContainer = screen.getByTestId("input-container");
        const mapContainer = screen.getByTestId("map-container");

        mockElementGeometry(inputContainer, 1000, 1000);
        mockElementGeometry(mapContainer, 1500, 1500);

        const user = userEvent.setup();

        await user.pointer([
          {
            target: inputContainer,
            coords: { x: 0, y: 0 },
            keys: "[MouseLeft>]",
          },
          { target: inputContainer, coords: { x: -10000, y: -10000 } },
          {
            target: inputContainer,
            coords: { x: -10000, y: -10000 },
            keys: "[/MouseLeft]",
          },
        ]);
        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
          getRightBound() -
            mapContainer.clientWidth * Number(mapContainer.style.scale),
        );
        expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
          getBottomBound() -
            mapContainer.clientHeight * Number(mapContainer.style.scale),
        );
      });
    });

    describe("mouse transformation", () => {
      describe("zooming with scrollwheel", () => {
        it("zooms in", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const mouseZoomInEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
          });

          expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

          inputContainer.dispatchEvent(mouseZoomInEvent);

          expect(Number(mapContainer.style.scale)).toBeGreaterThan(
            DEFAULT_SCALE,
          );
        });
        it("zooms out", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: 10,
          });

          expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

          inputContainer.dispatchEvent(mouseZoomOutEvent);

          expect(Number(mapContainer.style.scale)).toBeLessThan(DEFAULT_SCALE);
        });

        it("stops at maximum", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const mouseZoomInEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
          });

          expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

          while (Number(mapContainer.style.scale) !== MAX_ZOOM) {
            inputContainer.dispatchEvent(mouseZoomInEvent);
          }

          inputContainer.dispatchEvent(mouseZoomInEvent);

          expect(Number(mapContainer.style.scale)).toBe(MAX_ZOOM);
        });

        it("stops at minimum", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: 10,
          });

          expect(mapContainer.style.scale).toBe(`${DEFAULT_SCALE}`);

          while (Number(mapContainer.style.scale) !== MIN_ZOOM) {
            inputContainer.dispatchEvent(mouseZoomOutEvent);
          }

          inputContainer.dispatchEvent(mouseZoomOutEvent);

          expect(Number(mapContainer.style.scale)).toBe(MIN_ZOOM);
        });

        it("moves the map outward when zooming in", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          const zoomInEvent = new WheelEvent("wheel", {
            deltaY: -10,
            clientX: inputContainer.clientWidth / 2,
            clientY: inputContainer.clientHeight / 2,
          });

          inputContainer.dispatchEvent(zoomInEvent);

          expect(
            Number(mapContainer.style.left.replace("px", "")),
          ).toBeLessThan(0);
          expect(Number(mapContainer.style.top.replace("px", ""))).toBeLessThan(
            0,
          );
        });

        it("moves the map inward when zooming out", () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const mouseZoomOutEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: 10,
            clientX: window.innerWidth / 2,
            clientY: window.innerHeight / 2,
          });

          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          inputContainer.dispatchEvent(mouseZoomOutEvent);

          expect(
            Number(mapContainer.style.left.replace("px", "")),
          ).toBeGreaterThan(0);
          expect(
            Number(mapContainer.style.top.replace("px", "")),
          ).toBeGreaterThan(0);
        });

        it("bounds the map when zooming from top left", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
            clientX: 0,
            clientY: 0,
          });

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: 10000, y: 10000 } },
            {
              target: inputContainer,
              coords: { x: 10000, y: 10000 },
              keys: "[/MouseLeft]",
            },
          ]);
          inputContainer.dispatchEvent(mouseZoomEvent);

          expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
            getLeftBound(inputContainer.clientWidth),
          );
          expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
            getTopBound(inputContainer.clientHeight),
          );
        });

        it("bounds the map when zooming from bottom right", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
            clientX: window.innerWidth,
            clientY: window.innerHeight,
          });

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: -10000, y: -10000 } },
            {
              target: inputContainer,
              coords: { x: -10000, y: -10000 },
              keys: "[/MouseLeft]",
            },
          ]);
          inputContainer.dispatchEvent(mouseZoomEvent);

          const scale = Number(mapContainer.style.scale);

          expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
            getRightBound() - mapContainer.clientWidth * scale,
          );
          expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
            getBottomBound() - mapContainer.clientHeight * scale,
          );
        });
      });

      describe("moving by dragging", () => {
        it("moves the map correctly", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          await user.pointer([
            { target: inputContainer, coords: { x: 100, y: 100 } },
          ]);

          // map shouldn't move
          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: 100, y: 100 } },
            {
              target: inputContainer,
              coords: { x: 100, y: 100 },
              keys: "[/MouseLeft]",
            },
          ]);

          // map should move
          expect(
            Number(mapContainer.style.left.replace("px", "")),
          ).toBeGreaterThan(0);
          expect(
            Number(mapContainer.style.top.replace("px", "")),
          ).toBeGreaterThan(0);
        });

        it("is bounded from bottom right", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: 10000, y: 10000 } },
            {
              target: inputContainer,
              coords: { x: 10000, y: 10000 },
              keys: "[/MouseLeft]",
            },
          ]);

          expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
            getLeftBound(inputContainer.clientWidth),
          );
          expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
            getTopBound(inputContainer.clientHeight),
          );
        });

        it("is bounded from top left", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          expect(mapContainer.style.left).toBe("0px");
          expect(mapContainer.style.top).toBe("0px");

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: -10000, y: -10000 } },
            {
              target: inputContainer,
              coords: { x: -10000, y: -10000 },
              keys: "[/MouseLeft]",
            },
          ]);

          expect(Number(mapContainer.style.left.replace("px", ""))).toBe(
            getRightBound() -
              mapContainer.clientWidth * Number(mapContainer.style.scale),
          );
          expect(Number(mapContainer.style.top.replace("px", ""))).toBe(
            getBottomBound() -
              mapContainer.clientHeight * Number(mapContainer.style.scale),
          );
        });

        it("disabled room hovering", async () => {
          customRender(<MapView />);

          const inputContainer = screen.getByTestId("input-container");
          const mapContainer = screen.getByTestId("map-container");

          mockElementGeometry(inputContainer, 1000, 1000);
          mockElementGeometry(mapContainer, 1500, 1500);

          const user = userEvent.setup();

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: MOVE_THRESHOLD + 1, y: 0 } },
          ]);

          await waitFor(() => {
            const room = document.querySelector(
              '[data-room="A210"]',
            ) as SVGGraphicsElement;
            expect(room).toHaveStyle("pointer-events: none");
          });

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: MOVE_THRESHOLD + 1, y: 0 },
              keys: "[/MouseLeft]",
            },
          ]);

          await waitFor(() => {
            const room = document.querySelector(
              '[data-room="A210"]',
            ) as SVGGraphicsElement;
            expect(room).toHaveStyle("pointer-events: all");
          });

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: 0, y: 0 },
              keys: "[MouseLeft>]",
            },
            { target: inputContainer, coords: { x: MOVE_THRESHOLD - 1, y: 0 } },
          ]);

          await waitFor(() => {
            const room = document.querySelector(
              '[data-room="A210"]',
            ) as SVGGraphicsElement;
            expect(room).toHaveStyle("pointer-events: all");
          });

          await user.pointer([
            {
              target: inputContainer,
              coords: { x: MOVE_THRESHOLD - 1, y: 0 },
              keys: "[/MouseLeft]",
            },
          ]);

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
});
