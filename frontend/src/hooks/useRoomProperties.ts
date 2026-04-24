import { useEffect, useState } from "react";
import { findAllRooms } from "../services/roomsService";

const ROOM_LABEL_FONT_SIZE = 24;

function createRoomInfoLabel(
  centerX: number,
  centerY: number,
  lines: string[],
): SVGTextElement {
  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", String(centerX));
  text.setAttribute("y", String(centerY));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "middle");
  text.classList.add("room-label");

  const fontSize = ROOM_LABEL_FONT_SIZE;
  const lineHeight = fontSize * 1.2;
  // Offset the starting position so the label is centered in the middle of the room
  const offsetStart = -((lines.length - 1) / 2) * lineHeight;

  lines.forEach((line, i) => {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan",
    );
    tspan.setAttribute("x", String(centerX));
    tspan.setAttribute(
      "dy",
      i === 0 ? String(offsetStart) : String(lineHeight),
    );
    tspan.textContent = line;
    text.appendChild(tspan);
  });

  return text;
}

export const AvailabilityColors = {
  available: "#4ade80",
  limited: "#facc15",
  full: "#f87171",
};

export const DepartmentColors = new Map([
  ["H516 MATHSTAT", "#4ade80"],
  ["H523 CS", "#667eea"],
]);

export function getDepartmentColor(
  departmentName: string | null | undefined,
): string {
  if (departmentName === null || departmentName === undefined) return "#aaaaaa";
  return DepartmentColors.get(departmentName) || "#aaaaaa";
}

const LIMITED_CAPACITY_THRESHOLD = 2;

function getRoomAvailability(
  capacity: number | null,
  occupants: number | null,
): "available" | "limited" | "full" {
  if (capacity === null || occupants === null) {
    return "full";
  }

  if (occupants === 0 || occupants < capacity - LIMITED_CAPACITY_THRESHOLD) {
    return "available";
  }

  if (occupants < capacity) {
    return "limited";
  }

  return "full";
}

export function getElementBBox(element: SVGElement): DOMRect {
  if (element instanceof SVGGraphicsElement) {
    return element.getBBox();
  }
  return new DOMRect(0, 0, 1, 1);
}

export async function updateRooms(useAvailability: boolean) {
  try {
    const result = await findAllRooms();

    const roomsMap = new Map(result.map((room) => [room.name, room]));

    const roomElements = document.querySelectorAll("path[data-room]");

    for (const element of roomElements) {
      const roomName = element.getAttribute("data-room");

      if (!roomName || !roomsMap.has(roomName)) continue;

      const room = roomsMap.get(roomName);

      if (!room) continue;

      const hasActive = element.classList.contains("active");
      element.classList.remove(...element.classList);
      element.classList.add("room");
      if (hasActive) {
        element.classList.add("active");
      }

      if (!(element instanceof SVGElement)) continue;

      if (useAvailability) {
        const availabilityState = getRoomAvailability(
          room.capacity,
          room.contracts.length,
        );
        element.style.fill = AvailabilityColors[availabilityState];
        element.classList.add(availabilityState);
      } else {
        element.style.fill = getDepartmentColor(room.department?.name);
      }

      const oldText =
        element.parentElement?.getElementsByClassName("room-label")[0];
      const centerX = Number(oldText?.getAttribute("x"));
      const centerY = Number(oldText?.getAttribute("y"));

      const lines = [
        roomName,
        `${room.area}m²`,
        `${room.contracts.length}/${room.capacity}`,
      ];

      const label = createRoomInfoLabel(centerX, centerY, lines);

      element.parentElement
        ?.getElementsByClassName("room-label")[0]
        .replaceWith(label);
    }
  } catch (error: unknown) {
    let errorMessage = "❌ Failed to update rooms: ";
    if (error instanceof Error) {
      errorMessage += error.message;
    }
    console.log(errorMessage);
  }
}

export function useRoomProperties() {
  const [useAvailability, setUseAvailability] = useState(true);

  async function onRoomUpdate() {
    await updateRooms(useAvailability);
  }

  useEffect(() => {
    async function addColorToRooms() {
      try {
        const result = await findAllRooms();

        const roomsMap = new Map(result.map((room) => [room.name, room]));

        const roomElements = document.querySelectorAll("path[data-room]");

        for (const element of roomElements) {
          const roomName = element.getAttribute("data-room");
          if (!roomName || !roomsMap.has(roomName)) continue;

          const room = roomsMap.get(roomName);
          if (!room) continue;

          const hasActive = element.classList.contains("active");
          element.classList.remove(...element.classList);
          element.classList.add("room");
          if (hasActive) {
            element.classList.add("active");
          }

          if (!(element instanceof SVGElement)) continue;

          if (useAvailability) {
            const availabilityState = getRoomAvailability(
              room.capacity,
              room.contracts.length,
            );
            element.style.fill = AvailabilityColors[availabilityState];
            element.classList.add(availabilityState);
          } else {
            element.style.fill = getDepartmentColor(room.department?.name);
          }
        }
      } catch (error: unknown) {
        let errorMessage = "❌ Failed to add color to rooms: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        }
        console.log(errorMessage);
      }
    }
    void addColorToRooms();
  }, [useAvailability]);

  useEffect(() => {
    async function addTextToRooms() {
      try {
        const result = await findAllRooms();

        const roomsMap = new Map(result.map((room) => [room.name, room]));

        const roomElements = document.querySelectorAll("path[data-room]");

        for (const element of roomElements) {
          if (element.parentElement?.classList.contains("room-group")) break;

          const roomName = element.getAttribute("data-room");

          if (!roomName || !roomsMap.has(roomName)) continue;

          const room = roomsMap.get(roomName);

          if (!room) continue;

          element.id = String(room.id);
          element.classList.add("room");

          if (!(element instanceof SVGElement)) continue;

          const parent = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "g",
          );
          parent.classList.add("room-group");
          element.parentElement?.appendChild(parent);
          parent.appendChild(element);

          const bbox = getElementBBox(element);
          const centerX = bbox.x + bbox.width / 2;
          const centerY = bbox.y + bbox.height / 2;

          const lines = [
            roomName,
            `${room.area}m²`,
            `${room.contracts.length}/${room.capacity}`,
          ];

          const label = createRoomInfoLabel(centerX, centerY, lines);
          parent.appendChild(label);
        }
      } catch (error: unknown) {
        let errorMessage = "❌ Failed to add text to rooms: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        }
        console.log(errorMessage);
      }
    }
    void addTextToRooms();
  }, []);

  return {
    useAvailability: useAvailability,
    setUseAvailability: setUseAvailability,
    onRoomUpdate: onRoomUpdate,
  };
}
