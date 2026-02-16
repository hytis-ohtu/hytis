import { X } from "lucide-react";
import { motion } from "motion/react";
import type { Room } from "../types";
import "./RoomDetails.css";

function RoomDetails({
  room,
  handleClose,
}: {
  room: Room | null;
  handleClose: () => void;
}) {
  if (!room) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="room-details"
    >
      <header className="room-details-header">
        <h1 className="room-details-title">Huone</h1>
        <X className="room-details-close-button" onClick={handleClose} />
      </header>
      <div className="room-details-avatar">
        <h2 className="room-details-avatar-name">{room.name}</h2>
      </div>
    </motion.div>
  );
}

export default RoomDetails;
