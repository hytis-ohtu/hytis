import { motion } from "motion/react";
import RoomInfo from "./RoomInfo";
import RoomPeople from "./RoomPeople";
import "./SidePanel.css";

function SidePanel() {
  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="side-panel"
    >
      <RoomInfo />
      <RoomPeople />
    </motion.div>
  );
}

export default SidePanel;
