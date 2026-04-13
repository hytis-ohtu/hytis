import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useMapTransform } from "../hooks/useMapTransform";
import { findAllRooms, findRoomById } from "../services/roomsService";
import { useRoomSelection } from "../hooks/useRoomSelection";
import ColorToggle from "./ColorToggle";
import "./MainView.css";
import SidePanel from "./SidePanel";
import ZoomButtons from "./ZoomButtons";

const ROOM_LABEL_FONT_SIZE = 24;

function MainView() {
  const {
    mapContainer,
    inputContainer,
    hasMoved,
    handleZoomFunc,
    handleResetFunc,
  } = useMapTransform();
  const { activeRoomId, isSidePanelOpen, room, setActiveRoomId, setIsSidePanelOpen, selectedPersonId, setRoom } = useRoomSelection();

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
    if (hasMoved.current) return;

    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[data-room]");
      if (target?.id) {
        console.log("Clicked room with id:", target.id);
        setIsSidePanelOpen(true);
        setActiveRoomId(target.id);
        await findRoom(target.id);
      }
    }
  }

  return (
    <>
      <div className="wrapper">
        <div ref={inputContainer} className="click-container">
          <div ref={mapContainer} className="map-container">
            <Exactum2 className="map" onClick={handleClick} />
          </div>
        </div>

        <ZoomButtons
          handleZoom={handleZoomFunc}
          handleReset={handleResetFunc}
        />

        <ColorToggle />

        <AnimatePresence>
          {isSidePanelOpen && (
            <SidePanel
              room={room}
              selectedPersonId={selectedPersonId}
              handleClose={() => {
                setIsSidePanelOpen(false);
                setActiveRoomId(null);
              }}
              onPersonSaved={() => findRoom(activeRoomId!)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default MainView;
