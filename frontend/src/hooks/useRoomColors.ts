import { useEffect, useState } from "react";
import { findAllRooms } from "../services/roomsService";

export const AvailabilityColors = {
  available: "#4ade80",
  limited: "#facc15",
  full: "#f87171",
};

export function getDepartmentColor(departmentName: string): string {
  const color = DepartmentColors.get(departmentName) || null;
  if (color === null) return "#aaaaaa";
  return color;
}

const DepartmentColors = new Map([
  ["H516 MATHSTAT", "#4ade80"],
  ["H523 CS", "#667eea"],
]);

const LIMITED_CAPACITY_THRESHOLD = 2;

function getRoomAvailability(
  capacity: number,
  occupants: number,
): "available" | "limited" | "full" {
  if (occupants === 0 || occupants < capacity - LIMITED_CAPACITY_THRESHOLD) {
    return "available";
  }
  if (occupants < capacity) {
    return "limited";
  }
  return "full";
}

export function useRoomColors() {
  const [useAvailability, setUseAvailability] = useState(true);

  useEffect(() => {
    async function mapRoomColors() {
      try {
        const result = await findAllRooms();

        const roomsMap = new Map(result.map((room) => [room.name, room]));

        const roomElements = document.querySelectorAll("path[data-room]");

        for (const element of roomElements) {
          const roomName = element.getAttribute("data-room");
          if (!roomName || !roomsMap.has(roomName)) continue;

          const room = roomsMap.get(roomName);
          if (!room) continue;

          if (!(element instanceof SVGGraphicsElement)) continue;

          if (useAvailability) {
            const availabilityState = getRoomAvailability(
              room.capacity,
              room.contracts.length,
            );
            element.style.fill = AvailabilityColors[availabilityState];
          } else {
            element.style.fill = getDepartmentColor(room.department.name);
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
    mapRoomColors();
  }, [useAvailability]);

  return {
    useAvailability: useAvailability,
    setUseAvailability: setUseAvailability,
  };
}
