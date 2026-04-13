import { X } from "lucide-react";
import { motion } from "motion/react";
import "react-loading-skeleton/dist/skeleton.css";
import type { Room } from "../types";
import RoomOccupants from "./RoomOccupants";
import RoomInfo from "./RoomInfo";
import "./SidePanel.css";

function SidePanel({
  room: roomProp,
  handleClose,
  onPersonSaved,
  selectedPersonId,
}: {
  room: Room | null;
  handleClose: () => void;
  onPersonSaved: () => void;
  selectedPersonId: number | null;
}) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="room-details"
    >
      <header className="room-details-header">
        <h1 className="room-details-title">Huone</h1>
        <X
          data-testid="close-room-details-panel"
          className="room-details-close-button"
          onClick={handleClose}
        />
      </header>

      <RoomInfo room={roomProp} />

      <RoomOccupants room={roomProp} onPersonSaved={onPersonSaved} selectedPersonId={selectedPersonId} />
    </motion.div>
  );
}

export default SidePanel;
