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
import { useState } from "react";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { editRoom } from "../services/roomsService";
import { renderValue } from "../utils/renderValue";
import RoomModal from "./RoomModal";
import "./SidePanel.css";

function RoomInfo() {
  const { activeRoom, selectRoom, closeSidePanel } = useRoomSelection();
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const roomId = activeRoom?.id;
  const isLoaded = activeRoom !== null && activeRoom !== undefined;

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
          {renderValue(activeRoom?.name, (value) => " " + value, "-", {
            skeletonProps: {
              width: "4ch",
              style: { marginLeft: "0.5rem" },
            },
          })}
        </h2>
        <ChevronDown />
        <button className="button-icon" onClick={() => setEditRoomOpen(true)}>
          <SquarePen />
        </button>
        <button className="button-icon" onClick={closeSidePanel}>
          <X />
        </button>
      </header>

      {/* Room Details */}
      <div className="room-details">
        <div className="room-detail">
          <LandPlot />
          <p>{renderValue(activeRoom?.area, (value) => `${value} m²`)}</p>
        </div>
        <div className="room-detail">
          <User />
          <p>{renderValue(activeRoom?.capacity, (value) => value)}</p>
        </div>
        <div className="room-detail">
          <Container />
          <p>
            {renderValue(
              activeRoom?.roomType,
              (value) => value.name,
              "Ei tyyppiä",
            )}
          </p>
        </div>
        <div className="room-detail">
          <Section />
          <p>
            {renderValue(
              activeRoom?.department,
              (value) => value.name,
              "Ei osastoa",
            )}
          </p>
        </div>
        <div className="room-description">
          <p className="room-description-title">Lisätiedot</p>
          <p>
            {renderValue(
              activeRoom?.freeText,
              (value) => value,
              "Ei lisätietoja",
            )}
          </p>
        </div>
      </div>

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
