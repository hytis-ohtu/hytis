import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import MainView from "../../src/components/MainView.tsx";
import { RoomSelectionProvider } from "../../src/components/RoomSelectionProvider.tsx";
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
} from "../../src/hooks/useRoomProperties";
import { findAllRooms, findRoomById } from "../../src/services/roomsService";
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

describe("MainView", () => {
  describe("initial render", () => {
    it("contains the map svg", () => {
      customRender(<MainView />);

      expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
    });

    it("maps room data correctly to SVG elements", async () => {
      customRender(<MainView />);

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
      customRender(<MainView />);

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
    it("is correct when showing departments", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();
      await user.click(screen.getByTestId("switch-color-mode"));

      await waitFor(() => {
        const room = document.querySelector(
          '[data-room="A210"]',
        ) as SVGGraphicsElement;
        expect(room).toHaveStyle(
          `fill: ${getDepartmentColor(testRooms[0].department.name)}`,
        );
      });
    });

    it("legend is displayed", async () => {
      customRender(<MainView />);

      const legend = screen.getByTestId("legend");

      await waitFor(() => {
        expect(legend).toBeInTheDocument();
      });
    });

    it("legend is rendered after switching color modes", async () => {
      customRender(<MainView />);

      const user = userEvent.setup();

      const legend = screen.getByTestId("legend");

      await waitFor(() => {
        expect(legend).toBeInTheDocument();
      });

      await user.click(screen.getByTestId("switch-color-mode"));

      expect(screen.getByTestId("legend")).toBeInTheDocument();
    });
  });

  describe("MapTransform", () => {
    describe("zooming with buttons", () => {
      it("zooms in and out correctly", async () => {
        customRender(<MainView />);

        const user = userEvent.setup();

        const map = document.getElementsByClassName(
          "map-container",
        )[0] as SVGSVGElement;

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(map.style.scale)).toBeGreaterThan(DEFAULT_SCALE);

        await user.click(screen.getByRole("button", { name: /loitonna/i }));
        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        expect(Number(map.style.scale)).toBeLessThan(DEFAULT_SCALE);
      });

      it("stops at maximum zoom level", async () => {
        customRender(<MainView />);

        const user = userEvent.setup();

        const map = document.getElementsByClassName(
          "map-container",
        )[0] as SVGSVGElement;

        while (Number(map.style.scale) !== MAX_ZOOM) {
          await user.click(screen.getByRole("button", { name: /suurenna/i }));
        }

        await user.click(screen.getByRole("button", { name: /suurenna/i }));

        expect(Number(map.style.scale)).toBe(MAX_ZOOM);
      });

      it("stops at minimum zoom level", async () => {
        customRender(<MainView />);

        const user = userEvent.setup();

        const map = document.getElementsByClassName(
          "map-container",
        )[0] as SVGSVGElement;

        expect(map.style.scale).toBe(`${DEFAULT_SCALE}`);

        while (Number(map.style.scale) !== MIN_ZOOM) {
          await user.click(screen.getByRole("button", { name: /loitonna/i }));
        }

        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        expect(Number(map.style.scale)).toBe(MIN_ZOOM);
      });

      it("is bounded from top left", async () => {
        customRender(<MainView />);

        const user = userEvent.setup();

        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as SVGSVGElement;

        await user.pointer([
          { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
          { target: inputDiv, coords: { x: 10000, y: 10000 } },
          {
            target: inputDiv,
            coords: { x: 10000, y: 10000 },
            keys: "[/MouseLeft]",
          },
        ]);
        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
        expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
      });

      it("bounds the map when zooming with buttons from bottom right", async () => {
        customRender(<MainView />);

        const user = userEvent.setup();
        const inputDiv = document.getElementsByClassName(
          "click-container",
        )[0] as HTMLDivElement;
        const map = document.getElementsByClassName(
          "map-container",
        )[0] as HTMLDivElement;

        await user.pointer([
          { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
          { target: inputDiv, coords: { x: -10000, y: -10000 } },
          {
            target: inputDiv,
            coords: { x: -10000, y: -10000 },
            keys: "[/MouseLeft]",
          },
        ]);
        await user.click(screen.getByRole("button", { name: /loitonna/i }));

        const scale = Number(map.style.scale);

        expect(Number(map.style.left.replace("px", ""))).toBe(
          getRightBound() - window.innerWidth * scale,
        );
        expect(Number(map.style.top.replace("px", ""))).toBe(
          getBottomBound() - window.innerHeight * scale,
        );
      });
    });

    describe("mouse transformation", () => {
      describe("zooming with scrollwheel", () => {
        it("zooms in", () => {
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

        it("zooms out", () => {
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

        it("stops at maximum", () => {
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

        it("stops at minimum", () => {
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

        it("moves the map outward when zooming in", () => {
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

        it("moves the map inward when zooming out", () => {
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

        it("bounds the map when zooming from top left", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;
          const map = document.getElementsByClassName(
            "map-container",
          )[0] as HTMLDivElement;

          const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
            clientX: 0,
            clientY: 0,
          });

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: 10000, y: 10000 } },
            {
              target: inputDiv,
              coords: { x: 10000, y: 10000 },
              keys: "[/MouseLeft]",
            },
          ]);
          inputDiv.dispatchEvent(mouseZoomEvent);

          expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
          expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
        });

        it("bounds the map when zooming from bottom right", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;
          const map = document.getElementsByClassName(
            "map-container",
          )[0] as HTMLDivElement;

          const mouseZoomEvent: WheelEvent = new WheelEvent("wheel", {
            deltaY: -10,
            clientX: window.innerWidth,
            clientY: window.innerHeight,
          });

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: -10000, y: -10000 } },
            {
              target: inputDiv,
              coords: { x: -10000, y: -10000 },
              keys: "[/MouseLeft]",
            },
          ]);
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

      describe("moving by dragging", () => {
        it("moves the map correctly", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;
          const map = document.getElementsByClassName(
            "map-container",
          )[0] as HTMLDivElement;

          expect(map.style.left).toBe("0px");
          expect(map.style.top).toBe("0px");

          await user.pointer([
            { target: inputDiv, coords: { x: 100, y: 100 } },
          ]);

          // map shouldn't move
          expect(map.style.left).toBe("0px");
          expect(map.style.top).toBe("0px");

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: 100, y: 100 } },
            {
              target: inputDiv,
              coords: { x: 100, y: 100 },
              keys: "[/MouseLeft]",
            },
          ]);

          // map should move
          expect(Number(map.style.left.replace("px", ""))).toBeGreaterThan(0);
          expect(Number(map.style.top.replace("px", ""))).toBeGreaterThan(0);
        });

        it("is bounded from bottom right", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;
          const map = document.getElementsByClassName(
            "map-container",
          )[0] as HTMLDivElement;

          expect(map.style.left).toBe("0px");
          expect(map.style.top).toBe("0px");

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: 10000, y: 10000 } },
            {
              target: inputDiv,
              coords: { x: 10000, y: 10000 },
              keys: "[/MouseLeft]",
            },
          ]);

          expect(Number(map.style.left.replace("px", ""))).toBe(getLeftBound());
          expect(Number(map.style.top.replace("px", ""))).toBe(getTopBound());
        });

        it("is bounded from top left", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;
          const map = document.getElementsByClassName(
            "map-container",
          )[0] as HTMLDivElement;

          expect(map.style.left).toBe("0px");
          expect(map.style.top).toBe("0px");

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: -10000, y: -10000 } },
            {
              target: inputDiv,
              coords: { x: -10000, y: -10000 },
              keys: "[/MouseLeft]",
            },
          ]);

          const scale = Number(map.style.scale);

          expect(Number(map.style.left.replace("px", ""))).toBe(
            getRightBound() - window.innerWidth * scale,
          );
          expect(Number(map.style.top.replace("px", ""))).toBe(
            getBottomBound() - window.innerHeight * scale,
          );
        });

        it("disabled room hovering", async () => {
          customRender(<MainView />);

          const user = userEvent.setup();

          const inputDiv = document.getElementsByClassName(
            "click-container",
          )[0] as HTMLDivElement;

          await user.pointer([
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: MOVE_THRESHOLD + 1, y: 0 } },
          ]);

          await waitFor(() => {
            const room = document.querySelector(
              '[data-room="A210"]',
            ) as SVGGraphicsElement;
            expect(room).toHaveStyle("pointer-events: none");
          });

          await user.pointer([
            {
              target: inputDiv,
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
            { target: inputDiv, coords: { x: 0, y: 0 }, keys: "[MouseLeft>]" },
            { target: inputDiv, coords: { x: MOVE_THRESHOLD - 1, y: 0 } },
          ]);

          await waitFor(() => {
            const room = document.querySelector(
              '[data-room="A210"]',
            ) as SVGGraphicsElement;
            expect(room).toHaveStyle("pointer-events: all");
          });

          await user.pointer([
            {
              target: inputDiv,
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
