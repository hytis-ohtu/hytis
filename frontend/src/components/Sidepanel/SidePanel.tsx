import { motion } from "motion/react";
import { EXPAND_COLLAPSE_TRANSITION } from "../../utils/motionTransitions";
import RoomInfo from "./RoomInfo/RoomInfo";
import RoomPeople from "./RoomPeople/RoomPeople";
import "./SidePanel.css";

type SidePanelProps = {
  onRoomUpdate: () => Promise<void>;
};

function SidePanel({ onRoomUpdate }: SidePanelProps) {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={EXPAND_COLLAPSE_TRANSITION}
      className="side-panel"
    >
      <RoomInfo onRoomUpdate={onRoomUpdate} />
      <RoomPeople onRoomUpdate={onRoomUpdate} />
    </motion.div>
  );
}

export default SidePanel;
