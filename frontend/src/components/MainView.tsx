import { useEffect, useState } from "react";
import Exactum2 from "../assets/exactum-2.svg?react";
import { useAuth } from "../contexts/AuthContext";
import { findAllRooms, findRoomById } from "../services/roomsService";
import "./MainView.css";

function MainView() {
  const { user, logout } = useAuth();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  useEffect(() => {
    async function mapIdsToRoomElements() {
      try {
        const result = await findAllRooms();

        const roomsMap = new Map(result.map((room) => [room.name, room.id]));

        const roomElements = document.querySelectorAll("path[data-room]");

        roomElements.forEach((element) => {
          const roomName = element.getAttribute("data-room");
          if (roomName && roomsMap.has(roomName)) {
            element.id = String(roomsMap.get(roomName));
          }
        });
      } catch (error: unknown) {
        let errorMessage = "❌ Failed to map rooms: ";
        if (error instanceof Error) {
          errorMessage += error.message;
        }
        console.log(errorMessage);
      }
    }
    mapIdsToRoomElements();
  }, []);

  useEffect(() => {
    const rooms = document.querySelectorAll("path[data-room]");
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
      const target = event.target.closest("path[data-room]");
      if (target?.id) {
        console.log("Clicked room with id:", target.id);
        await findRoom(target.id);
        setActiveRoomId(target.id);
      }
    }
  }

  return (
    <>
      <header className="main-header">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <button className="logout-button" onClick={() => void logout()}>
            Logout
          </button>
        </div>
      </header>
      <div className="wrapper">
        <Exactum2 className="floor-image" onClick={handleClick} />
      </div>
    </>
  );
}

export default MainView;
