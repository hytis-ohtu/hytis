import { AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import Exactum2 from "../assets/exactum-2.svg?react";
import { useAuth } from "../contexts/AuthContext";
import { useMapTransform } from "../hooks/useMapTransform";
import { findRoomById } from "../services/roomsService";
import type { Room } from "../types";
import "./MainView.css";
import RoomDetails from "./RoomDetails";

function MainView() {
  const { mapContainer, inputContainer, hasMoved } = useMapTransform();
  const { user, logout } = useAuth();

  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);

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
      setRoom(result);
    } catch (error: unknown) {
      let errorMessage = "❌ Failed to fetch room details: ";
      if (error instanceof Error) {
        errorMessage += error.message;
      }
      console.log(errorMessage);
    }
  }

  async function handleClick(event: React.MouseEvent<SVGSVGElement>) {
    if (hasMoved.current) return;

    if (event.target instanceof SVGElement) {
      const target = event.target.closest("path[data-room]");
      if (target?.id) {
        console.log("Clicked room with id:", target.id);
        await findRoom(target.id);
        setActiveRoomId(target.id);
        setIsRoomDetailsOpen(true);
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
        <div className="main-container">
          <div ref={inputContainer} className="click-container">
            <div ref={mapContainer} className="map-container">
              <Exactum2 className="map" onClick={handleClick} />
            </div>
          </div>
        </div>
        <AnimatePresence>
          {isRoomDetailsOpen && (
            <RoomDetails
              room={room}
              handleClose={() => setIsRoomDetailsOpen(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default MainView;
