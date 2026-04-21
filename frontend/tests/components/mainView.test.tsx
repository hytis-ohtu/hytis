import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MainView from "../../src/components/MainView.tsx";
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
  updateRooms,
} from "../../src/hooks/useRoomProperties";
import { findAllRooms, findRoomById } from "../../src/services/roomsService";
import { rooms } from "../testData.ts";

vi.mock("../../src/contexts/AuthContext", () => ({
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

vi.mock("../../src/assets/exactum-2.min.svg?react", () => ({
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

vi.mock("../../src/services/roomsService");

describe("MainView", () => {
  it("renders without crashing", () => {
    vi.mocked(findAllRooms).mockResolvedValue([]);
    render(<MainView />);
    expect(screen.getByTestId("mock-svg")).toBeInTheDocument();
  });
  
  it("room structure is correct", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);
    
    await waitFor(() => {
      const room1 = document.querySelector('[data-room="A210"]');
      expect(room1).toHaveAttribute("id", "1");
      expect(room1).toHaveClass("room");
      expect(room1?.parentElement).toHaveClass("room-group");
      expect(room1?.nextSibling).toHaveClass("room-label");
      
      const room2 = document.querySelector('[data-room="A211"]');
      expect(room2).toHaveAttribute("id", "2");
      expect(room2).toHaveClass("room");
      expect(room2?.parentElement).toHaveClass("room-group");
      expect(room2?.nextSibling).toHaveClass("room-label");
      
      const room3 = document.querySelector('[data-room="A212"]');
      expect(room3).toHaveAttribute("id", "3");
      expect(room3).toHaveClass("room");
      expect(room3?.parentElement).toHaveClass("room-group");
      expect(room3?.nextSibling).toHaveClass("room-label");
    });
  });
  
  it("maps text to rooms correctly", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);
    
    await waitFor(() => {
      const room1 = document.querySelector('[data-room="A210"]');
      expect(room1?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[0].name);
      expect(room1?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[0].area + "m²");
      expect(room1?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[0].contracts.length + "/" + rooms[0].capacity);
      
      const room2 = document.querySelector('[data-room="A211"]');
      expect(room2?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[1].name);
      expect(room2?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[1].area + "m²");
      expect(room2?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[1].contracts.length + "/" + rooms[1].capacity);
      
      const room3 = document.querySelector('[data-room="A212"]');
      expect(room3?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[2].name);
      expect(room3?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[2].area + "m²");
      expect(room3?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[2].contracts.length + "/" + rooms[2].capacity);
    });
  });
  
  it("maps colors to rooms correctly", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

    await waitFor(() => {
      const availableRoom = document.querySelector('[data-room="A210"]');
      expect(availableRoom).toHaveClass("available");
      expect(availableRoom).toHaveStyle(`fill: ${AvailabilityColors["available"]}`);

      const limitedRoom = document.querySelector('[data-room="A211"]');
      expect(limitedRoom).toHaveClass("limited");
      expect(limitedRoom).toHaveStyle(`fill: ${AvailabilityColors["limited"]}`);

      const fullRoom = document.querySelector('[data-room="A212"]');
      expect(fullRoom).toHaveClass("full");
      expect(fullRoom).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
    });
  });

  it("room colors change correctly when showing departments", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

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
  
  it("room doesn't change from updating when nothing was changed", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);
    
    await waitFor(() => {
      const room = document.querySelector('[data-room="A212"]');
      
      expect(room?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[2].name);
      expect(room?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[2].area + "m²");
      expect(room?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[2].contracts.length + "/" + rooms[2].capacity);
      
      expect(room).toHaveClass("full");
      expect(room).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
    });
    
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    updateRooms(true);
    
    await waitFor(() => {
      const room = document.querySelector('[data-room="A212"]');
      
      expect(room?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[2].name);
      expect(room?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[2].area + "m²");
      expect(room?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[2].contracts.length + "/" + rooms[2].capacity);
      
      expect(room).toHaveClass("full");
      expect(room).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
    });
  });
  
  it("room updates correctly when contract is removed", async () => {
    vi.mocked(findAllRooms).mockResolvedValue([
      {
        id: 3,
        name: "A212",
        area: "9.70",
        capacity: 2,
        freeText: "",
        roomType: { id: 0, name: "" },
        department: {
          id: 1,
          name: "H516 MATHSTAT",
        },
        contracts: [
          {
            id: 6,
            startDate: "2024-01-15",
            endDate: "2025-12-31",
            person: {
              id: 6,
              firstName: "Päivi",
              lastName: "Koskinen",
              freeText: null,
              department: {
                id: 2,
                name: "H523 CS",
              },
              title: {
                id: 6,
                name: "asiantuntija",
              },
              researchGroup: {
                id: 2,
                name: "Ohjelmistotekniikan tutkimusryhmä",
              },
            },
          },
          {
            id: 7,
            startDate: "2023-09-01",
            endDate: "2025-08-31",
            person: {
              id: 7,
              firstName: "Robert",
              lastName: "Miller",
              freeText: null,
              department: {
                id: 1,
                name: "H516 MATHSTAT",
              },
              title: {
                id: 7,
                name: "harjoittelija",
              },
              researchGroup: {
                id: 1,
                name: "Algebrallisten rakenteiden tutkimusryhmä",
              },
            },
          },
        ],
      }
    ]);
    render(<MainView />);
    
    await waitFor(() => {
      const room = document.querySelector('[data-room="A212"]');
      
      expect(room?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[2].name);
      expect(room?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[2].area + "m²");
      expect(room?.nextSibling?.childNodes[2]).toHaveTextContent(rooms[2].contracts.length + "/" + rooms[2].capacity);
      
      expect(room).toHaveClass("full");
      expect(room).toHaveStyle(`fill: ${AvailabilityColors["full"]}`);
    });
    
    vi.mocked(findAllRooms).mockResolvedValue([
      {
        id: 3,
        name: "A212",
        area: "9.70",
        capacity: 2,
        freeText: "",
        roomType: { id: 0, name: "" },
        department: {
          id: 1,
          name: "H516 MATHSTAT",
        },
        contracts: [
          {
            id: 7,
            startDate: "2023-09-01",
            endDate: "2025-08-31",
            person: {
              id: 7,
              firstName: "Robert",
              lastName: "Miller",
              freeText: null,
              department: {
                id: 1,
                name: "H516 MATHSTAT",
              },
              title: {
                id: 7,
                name: "harjoittelija",
              },
              researchGroup: {
                id: 1,
                name: "Algebrallisten rakenteiden tutkimusryhmä",
              },
            },
          },
        ],
      }
    ]);
    updateRooms(true);
    
    await waitFor(() => {
      const room = document.querySelector('[data-room="A212"]');
      
      expect(room?.nextSibling?.childNodes[0]).toHaveTextContent(rooms[2].name);
      expect(room?.nextSibling?.childNodes[1]).toHaveTextContent(rooms[2].area + "m²");
      expect(room?.nextSibling?.childNodes[2]).toHaveTextContent(`${rooms[2].contracts.length - 1}` + "/" + rooms[2].capacity);
      
      expect(room).toHaveClass("limited");
      expect(room).toHaveStyle(`fill: ${AvailabilityColors["limited"]}`);
    });
  });

  it("incorrect department name returns error color", () => {
    const value = getDepartmentColor("incorrect name");
    expect(value).toBe("#aaaaaa");
  });

  it("renders legend with correct initial mode (availability)", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

    await waitFor(() => {
      const legend = screen.getByTestId("legend");
      expect(legend).toBeInTheDocument();
    });
  });

  it("legend switches to department mode when button is clicked", async () => {
    vi.mocked(findAllRooms).mockResolvedValue(rooms);
    render(<MainView />);

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
  render(<MainView />);

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
      render(<MainView />);

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
      render(<MainView />);

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
      render(<MainView />);

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
      render(<MainView />);

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
      render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
        render(<MainView />);

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
