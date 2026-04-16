import {
  ChevronDown,
  Container,
  LandPlot,
  Map,
  Section,
  SquarePen,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { editRoom } from "../services/roomsService";
import { renderValue } from "../utils/renderValue";
import RoomModal from "./RoomModal";
import "./SidePanel.css";

function RoomInfo() {
  const { activeRoom, selectRoom, closeSidePanel } = useRoomSelection();
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);
  const roomId = activeRoom?.id;
  const isLoaded = activeRoom !== null && activeRoom !== undefined;

  const toggleDetails = () => setDetailsCollapsed((previous) => !previous);

  const handleEditRoom = async (values: Record<string, string>) => {
    if (roomId == null) return;
    try {
      await editRoom(roomId, values);
      selectRoom(roomId);
    } catch (error) {
      console.error("Failed to edit room:", error);
    }
  };

  return (
    <section className="room-info">
      {/* Room Info Header */}
      <header>
        <Map />
        <h2>
          Huone
          {renderValue(activeRoom?.name, "–", (value) => " " + value, {
            skeletonProps: {
              width: "4ch",
              style: { marginLeft: "0.5rem" },
            },
          })}
        </h2>
        <button
          className="button-icon"
          onClick={toggleDetails}
          aria-label={
            detailsCollapsed ? "Avaa huoneen tiedot" : "Sulje huoneen tiedot"
          }
          aria-expanded={!detailsCollapsed}
        >
          <ChevronDown
            className={
              detailsCollapsed ? "section-chevron collapsed" : "section-chevron"
            }
          />
        </button>
        <button className="button-icon" onClick={() => setEditRoomOpen(true)}>
          <SquarePen />
        </button>
        <button className="button-icon" onClick={closeSidePanel}>
          <X />
        </button>
      </header>

      {/* Room Details */}
      <AnimatePresence initial={false}>
        {!detailsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="room-details">
              <div className="room-detail">
                <LandPlot />
                <p>
                  {renderValue(
                    activeRoom?.area,
                    "Ei pinta-alaa",
                    (value) => `${value} m²`,
                  )}
                </p>
              </div>
              <div className="room-detail">
                <User />
                <p>{renderValue(activeRoom?.capacity, "Ei kapasiteettia")}</p>
              </div>
              <div className="room-detail">
                <Container />
                <p title={activeRoom?.roomType?.name ?? "Ei tyyppiä"}>
                  {renderValue(
                    activeRoom?.roomType,
                    "Ei tyyppiä",
                    (value) => value.name,
                  )}
                </p>
              </div>
              <div className="room-detail">
                <Section />
                <p title={activeRoom?.department?.name ?? "Ei osastoa"}>
                  {renderValue(
                    activeRoom?.department,
                    "Ei osastoa",
                    (value) => value.name,
                  )}
                </p>
              </div>
              <div className="room-description">
                <p className="room-description-title">Lisätiedot</p>
                <p>{renderValue(activeRoom?.freeText, "Ei lisätietoja")}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Room Modal */}
      {editRoomOpen && isLoaded && (
        <RoomModal
          onClose={() => setEditRoomOpen(false)}
          onSubmit={handleEditRoom}
          initial={{
            capacity: String(activeRoom.capacity ?? ""),
            roomType: String(activeRoom.roomType.id ?? ""),
            department: String(activeRoom.department?.id ?? ""),
            freeText: activeRoom.freeText ?? "",
          }}
        />
      )}
    </section>
  );
}

export default RoomInfo;
