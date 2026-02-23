import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Exactum2 from "../assets/exactum-2.svg?react";
import { useAuth } from "../contexts/AuthContext";
import { findRoomById } from "../services/roomsService";
import type { Room } from "../types";
import "./MainView.css";
import RoomDetails from "./RoomDetails";

function MainView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const isClicked = useRef<boolean>(false);

  const transformValues = useRef<{
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    dist: number;
    scale: number;
  }>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    dist: 0,
    scale: 1,
  });

  useEffect(() => {
    if (!mapRef.current || !containerRef.current) return;

    const map = mapRef.current;
    const container = containerRef.current;

    const sensitivity = 0.05;
    const maxZoom = 3;
    const minZoom = 0.5;

    const onMouseDown = (e: MouseEvent) => {
      isClicked.current = true;
      transformValues.current.startX = e.clientX;
      transformValues.current.startY = e.clientY;
      transformValues.current.dist = 0;
    };

    const onMouseUp = (e: MouseEvent) => {
      isClicked.current = false;
      transformValues.current.lastX = map.offsetLeft;
      transformValues.current.lastY = map.offsetTop;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isClicked.current) return;

      const offsetX = e.clientX - transformValues.current.startX;
      const offsetY = e.clientY - transformValues.current.startY;
      transformValues.current.dist = Math.sqrt(
        offsetX * offsetX + offsetY * offsetY,
      );

      const nextX = offsetX + transformValues.current.lastX;
      const nextY = offsetY + transformValues.current.lastY;

      map.style.left = `${nextX}px`;
      map.style.top = `${nextY}px`;
    };

    const onScroll = (e: WheelEvent) => {
      const dir = Math.sign(e.deltaY);
      const speedEqualizer = Math.max(transformValues.current.scale, 1);

      const zoomAmount = -dir * speedEqualizer * sensitivity;
      let scale = transformValues.current.scale + zoomAmount;
      if (scale > maxZoom) scale = maxZoom;
      else if (scale < minZoom) scale = minZoom;

      let xPos = Number(map.style.left.replace("px", ""));
      let yPos = Number(map.style.top.replace("px", ""));
      const x = (e.clientX - xPos) / transformValues.current.scale;
      const y = (e.clientY - yPos) / transformValues.current.scale;
      xPos = e.clientX - x * scale;
      yPos = e.clientY - y * scale;

      transformValues.current.lastX = xPos;
      transformValues.current.lastY = yPos;
      transformValues.current.scale = scale;

      map.style.left = `${xPos}px`;
      map.style.top = `${yPos}px`;
      map.style.scale = `${scale}`;
    };

    container.addEventListener("mousedown", onMouseDown);
    container.addEventListener("mouseup", onMouseUp);
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseUp);
    container.addEventListener("wheel", onScroll);

    const cleanup = () => {
      container.removeEventListener("mousedown", onMouseDown);
      container.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseUp);
      container.removeEventListener("wheel", onScroll);
    };

    return cleanup;
  }, []);

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
    if (transformValues.current.dist > 10) return;

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
          <div ref={containerRef} className="click-container">
            <div ref={mapRef} className="map-container">
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
