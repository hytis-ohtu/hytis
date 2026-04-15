import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useMapTransform } from "../hooks/useMapTransform";
import { useRoomProperties } from "../hooks/useRoomProperties";
import { findRoomById } from "../services/roomsService";
import type { Room } from "../types";
import ColorToggle from "./ColorToggle";
import "./MainView.css";
import SidePanel from "./SidePanel";
import ZoomButtons from "./ZoomButtons";

function MainView() {
  const {
    mapContainer,
    inputContainer,
    hasMoved,
    handleZoomFunc,
    handleResetFunc,
  } = useMapTransform();

  const { useAvailability, setUseAvailability, onUpdate } = useRoomProperties();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);

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

  async function onRoomChange() {
    findRoom(activeRoomId!);
    onUpdate();
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

        <ColorToggle
          useAvailability={useAvailability}
          setUseAvailability={setUseAvailability}
        />

        <AnimatePresence>
          {isSidePanelOpen && (
            <SidePanel
              room={room}
              handleClose={() => {
                setIsSidePanelOpen(false);
                setActiveRoomId(null);
              }}
              onPersonSaved={() => onRoomChange()}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default MainView;
