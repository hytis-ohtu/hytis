import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useAuth } from "../contexts/AuthContext";
import { findAllRooms, findRoomById } from "../services/roomsService";
import type { Room } from "../types";
import "./MainView.css";
import RoomDetails from "./RoomDetails";

const ROOM_LABEL_FONT_SIZE = 24;

function MainView() {
  const { user, logout } = useAuth();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);

  function getRoomAvailability(
    capacity: number,
    occupants: number,
  ): "available" | "limited" | "full" {
    if (occupants === 0 || occupants < capacity - 2) {
      return "available";
    }
    if (occupants < capacity) {
      return "limited";
    }
    return "full";
  }

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
    text.style.fontSize = `${fontSize}px`;
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

  useEffect(() => {
    async function mapDataToRoomElements() {
      try {
        const result = await findAllRooms();

        const roomsMap = new Map(result.map((room) => [room.name, room]));

        const roomElements = document.querySelectorAll("path[data-room]");

        roomElements.forEach((element) => {
          const roomName = element.getAttribute("data-room");
          if (roomName && roomsMap.has(roomName)) {
            const room = roomsMap.get(roomName);

            if (room) {
              element.id = String(room.id);
              element.classList.add("room");

              const availabilityState = getRoomAvailability(
                room.capacity,
                room.contracts.length,
              );
              element.classList.add(availabilityState);

              if (element instanceof SVGGraphicsElement) {
                const bbox = element.getBBox();
                const centerX = bbox.x + bbox.width / 2;
                const centerY = bbox.y + bbox.height / 2;

                const lines = [
                  roomName,
                  `${room.area}m²`,
                  `${room.contracts.length}/${room.capacity}`,
                ];

                const group = document.createElementNS(
                  "http://www.w3.org/2000/svg",
                  "g",
                );
                group.classList.add("room-group");

                const label = createRoomInfoLabel(centerX, centerY, lines);

                element.parentNode?.insertBefore(group, element);
                group.appendChild(element);
                group.appendChild(label);
              }
            }
          }
        });
      } catch (error: unknown) {
        let errorMessage = "❌ Failed to map rooms: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        }
        console.log(errorMessage);
      }
    }
    mapDataToRoomElements();
  }, []);

  useEffect(() => {
    const rooms = document.querySelectorAll("path[data-room]");
    rooms.forEach((room) => {
      room.classList.toggle("active", room.id === activeRoomId);
    });
  }, [activeRoomId]);

  async function findRoom(id: string) {
    try {
      const result = await findRoomById(id);
      console.log("✅ Room details:", result);
      setRoom(result);
    } catch (error: unknown) {
      let errorMessage = "❌ Failed to fetch room details: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      console.log(errorMessage);
    }
  }

  async function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[data-room]");
      if (target?.id) {
        console.log("Clicked room with id:", target.id);
        await findRoom(target.id);
        setActiveRoomId(target.id);
        setIsRoomDetailsOpen(true);
      }
    }
  }

  return (
    <>
      <header className="main-header">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <button className="logout-button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="wrapper">
        <Exactum2 className="floor-image" onClick={handleClick} />
        <AnimatePresence>
          {isRoomDetailsOpen && (
            <RoomDetails
              room={room}
              handleClose={() => setIsRoomDetailsOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default MainView;
