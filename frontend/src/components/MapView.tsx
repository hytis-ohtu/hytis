import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useMapTransform } from "../hooks/useMapTransform";
import { useRoomProperties } from "../hooks/useRoomProperties";
import { useRoomSelection } from "../hooks/useRoomSelection";
import ColorToggle from "./ColorToggle";
import Legend from "./Legend";
import "./MapView.css";
import SidePanel from "./SidePanel";
import ZoomButtons from "./ZoomButtons";

function MapView() {
  const { mapContainer, inputContainer, hasMoved, handleZoom } =
    useMapTransform();

  const { useAvailability, setUseAvailability, onRoomUpdate } =
    useRoomProperties();
  const { activeRoom, selectRoom, activeRoomId } = useRoomSelection();

  useEffect(() => {
    const roomPaths = document.querySelectorAll("path[data-room]");
    roomPaths.forEach((roomPath) => {
      roomPath.classList.toggle("active", +roomPath.id === activeRoomId);
    });
  }, [activeRoomId]);

  function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (hasMoved.current) return;

    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[data-room]");
      if (target?.id && (+target?.id !== activeRoom?.id || !activeRoomId)) {
        void selectRoom(+target.id, null, false);
      }
    }
  }

  return (
    <main className="map-view">
      <div
        ref={inputContainer}
        className="input-container"
        data-testid="input-container"
      >
        <div
          ref={mapContainer}
          className="map-container"
          data-testid="map-container"
        >
          <Exactum2 onClick={handleClick} />
        </div>
      </div>

      <div className="map-overlay map-overlay-top-left">
        <ColorToggle
          useAvailability={useAvailability}
          setUseAvailability={setUseAvailability}
        />
        <Legend mode={useAvailability ? "availability" : "department"} />
      </div>

      <div className="map-overlay map-overlay-bottom-left">
        <ZoomButtons onZoom={handleZoom} />
      </div>

      <AnimatePresence>
        {activeRoomId !== null && <SidePanel onRoomUpdate={onRoomUpdate} />}
      </AnimatePresence>
    </main>
  );
}

export default MapView;
