import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useMapTransform } from "../hooks/useMapTransform";
import { useRoomProperties } from "../hooks/useRoomProperties";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { findRoomById } from "../services/roomsService";
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

  const { useAvailability, setUseAvailability } = useRoomProperties();

  const { room, setRoom } = useRoomSelection();

  useEffect(() => {
    const roomPaths = document.querySelectorAll("path[data-room]");
    roomPaths.forEach((roomPath) => {
      roomPath.classList.toggle("active", +roomPath.id === room?.id);
    });
  }, [room]);

  async function selectRoomById(id: string) {
    try {
      const room = await findRoomById(id);
      setRoom(room);
    } catch (error: unknown) {
      let errorMessage = "Failed to fetch room details: ";
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
        await selectRoomById(target.id);
      }
    }
  }

  return (
    <div className="wrapper">
      <div ref={inputContainer} className="click-container">
        <div ref={mapContainer} className="map-container">
          <Exactum2 className="map" onClick={handleClick} />
        </div>
      </div>

      <ZoomButtons handleZoom={handleZoomFunc} handleReset={handleResetFunc} />

      <ColorToggle
        useAvailability={useAvailability}
        setUseAvailability={setUseAvailability}
      />

      <AnimatePresence>
        {room && (
          <SidePanel
            room={room}
            handleClose={() => setRoom(null)}
            onPersonSaved={() => setRoom(room)}
            onRoomSaved={() => setRoom(room)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default MainView;
