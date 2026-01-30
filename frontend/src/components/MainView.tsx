import { useEffect, useState } from "react";
import Exactum2 from "../assets/exactum-2.svg?react";
import { findRoomById } from "../services/roomsService";
import "./MainView.css";

function MainView() {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    const rooms = document.querySelectorAll("path[id]");
    rooms.forEach((room) => {
      room.classList.add("room");
      room.classList.toggle("active", room.id === activeRoomId);
    });
  }, [activeRoomId]);

  async function findRoom(id: string) {
    try {
      const result = await findRoomById(id);
      console.log("✅ Room details:", result);
    } catch (error: unknown) {
      let errorMessage = "❌ Failed to fetch room details: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      console.log(errorMessage);
    }
  }

  async function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[id]");
      if (target?.id) {
        console.log("Clicked room with id:", target.id);
        await findRoom(target.id);
        setActiveRoomId(target.id);
      }
    }
  }

  return (
    <div className="wrapper">
      <Exactum2 className="floor-image" onClick={handleClick} />
    </div>
  );
}

export default MainView;
