import { motion } from "motion/react";
import type { Room } from "../types";
import RoomInfo from "./RoomInfo";
import RoomPeople from "./RoomPeople";
import "./SidePanel.css";

interface SidePanelProps {
  room: Room;
  onClose: () => void;
  onPersonSaved: () => void;
  onRoomSaved: () => void;
}

function SidePanel({
  room,
  onClose,
  onPersonSaved,
  onRoomSaved,
}: SidePanelProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="side-panel"
    >
      <RoomInfo room={room} onClose={onClose} onRoomSaved={onRoomSaved} />
      <RoomPeople room={room} onPersonSaved={onPersonSaved} />
    </motion.div>
  );
}

export default SidePanel;
