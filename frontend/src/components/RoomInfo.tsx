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
import Skeleton from "react-loading-skeleton";
import { editRoom } from "../services/roomsService";
import type { Room } from "../types";
import RoomModal from "./RoomModal";
import "./SidePanel.css";

interface RoomInfoProps {
  room: Room;
  onClose: () => void;
  onRoomSaved: () => void;
}

function RoomInfo({ room, onClose, onRoomSaved }: RoomInfoProps) {
  const [editRoomOpen, setEditRoomOpen] = useState(false);
  const {
    id: roomId,
    name = <Skeleton />,
    area = <Skeleton />,
    capacity = <Skeleton />,
    roomType,
    department,
    freeText = <Skeleton />,
  } = room;

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
    <section className="room-info">
      <header>
        <Map />
        <h2>{name}</h2>
        <ChevronDown />
        <button className="button-icon" onClick={() => setEditRoomOpen(true)}>
          <SquarePen />
        </button>
        <button className="button-icon" onClick={onClose}>
          <X />
        </button>
      </header>
      <div className="room-details">
        <div className="room-detail">
          <LandPlot />
          <p>{area} m²</p>
        </div>
        <div className="room-detail">
          <User />
          <p>{capacity}</p>
        </div>
        <div className="room-detail">
          <Container />
          <p>{roomType?.name ?? <Skeleton />}</p>
        </div>
        <div className="room-detail">
          <Section />
          <p>{department?.name ?? <Skeleton />}</p>
        </div>
        <div className="room-description">
          <p className="room-description-title">Lisätiedot</p>
          <p>{freeText}</p>
        </div>
      </div>
      {editRoomOpen && (
        <RoomModal
          onClose={() => setEditRoomOpen(false)}
          onSubmit={handleEditRoom}
          initial={{
            capacity: String(room.capacity ?? ""),
            roomType: String(room.roomType?.id ?? ""),
            department: String(room.department?.id ?? ""),
            freeText: room.freeText ?? "",
          }}
        />
      )}
    </section>
  );
}

export default RoomInfo;
