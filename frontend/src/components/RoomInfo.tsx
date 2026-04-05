import Skeleton from "react-loading-skeleton";
import type { Room } from "../types";
import "./SidePanel.css";

function RoomInfo({ room: roomProp }: { room: Room | null }) {
  const {
    name = <Skeleton />,
    area = <Skeleton />,
    capacity = <Skeleton />,
    roomType = <Skeleton />,
    department,
    freeText = <Skeleton />,
  } = (roomProp ?? {}) as Partial<Room>;

  return (
    <div>
      <div className="room-details-avatar">
        <h2 className="room-details-avatar-name">{name}</h2>
      </div>

      <section className="room-details-info">
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
