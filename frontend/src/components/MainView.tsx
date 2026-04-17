import { AnimatePresence } from "motion/react";
import { useEffect } from "react";
import Exactum2 from "../assets/exactum-2.min.svg?react";
import { useMapTransform } from "../hooks/useMapTransform";
import { useRoomProperties } from "../hooks/useRoomProperties";
import { useRoomSelection } from "../hooks/useRoomSelection";
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
  const { activeRoom, selectRoom, activeRoomId } = useRoomSelection();

  useEffect(() => {
    const roomPaths = document.querySelectorAll("path[data-room]");
    roomPaths.forEach((roomPath) => {
      roomPath.classList.toggle("active", +roomPath.id === activeRoomId);
    });
  }, [activeRoomId]);

  async function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (hasMoved.current) return;

    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[data-room]");
      if (target?.id && (+target?.id !== activeRoom?.id || !activeRoomId)) {
        await selectRoom(+target.id);
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
        {activeRoomId !== null && <SidePanel />}
      </AnimatePresence>
    </div>
  );
}

export default MainView;
