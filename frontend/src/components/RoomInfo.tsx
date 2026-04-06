import { Pencil } from "lucide-react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { editRoom } from "../services/roomsService";
import type { Room } from "../types";
import RoomModal from "./RoomModal";
import "./SidePanel.css";

function RoomInfo({
  room: roomProp,
  onRoomSaved,
}: {
  room: Room | null;
  onRoomSaved: () => void;
}) {
  const [editRoomOpen, setEditRoomOpen] = useState(false);

  const {
    id: roomId,
    name = <Skeleton />,
    area = <Skeleton />,
    capacity = <Skeleton />,
    roomType = <Skeleton />,
    department,
    freeText = <Skeleton />,
  } = (roomProp ?? {}) as Partial<Room>;

  const handleEditRoom = async (values: Record<string, string>) => {
    if (roomId === undefined) return;
    try {
      await editRoom(roomId, values);
      onRoomSaved();
    } catch (error) {
      console.error("Failed to edit room:", error);
    }
  };

  return (
    <div>
      <div className="room-details-avatar">
        <h2 className="room-details-avatar-name">{name}</h2>
      </div>

      <section className="room-details-info">
        {roomProp && (
          <Pencil
            data-testid="edit-room-button"
            size={16}
            onClick={() => setEditRoomOpen(true)}
            className="edit-room-button"
          />
        )}
        {editRoomOpen && roomProp && (
          <RoomModal
            onClose={() => setEditRoomOpen(false)}
            onSubmit={handleEditRoom}
            initial={{
              area: String(roomProp.area),
              capacity: String(roomProp.capacity),
              department: String(roomProp.department?.id ?? ""),
              freeText: roomProp.freeText ?? "",
            }}
          />
        )}
        <ul>
          <li>Pinta-ala: {area} m²</li>
          <li>Kapasiteetti: {capacity}</li>
          <li>Huonetyyppi: {roomType}</li>
          <li>Osasto: {department?.name ?? <Skeleton />}</li>
          <li>Lisätiedot: {freeText}</li>
        </ul>
      </section>
    </div>
  );
}

export default RoomInfo;
