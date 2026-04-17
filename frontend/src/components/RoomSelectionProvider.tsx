import { useEffect, useRef, useState } from "react";
import type {
  ExpandReq,
  RoomSelectionContextType,
} from "../contexts/RoomSelectionContext";
import { RoomSelectionContext } from "../contexts/RoomSelectionContext";
import type { Room } from "../types";

const SKELETON_DELAY_MS = 250;

interface RoomSelectionProviderProps {
  children: React.ReactNode;
  findRoomById: (roomId: number) => Promise<Room>;
}

export function RoomSelectionProvider({
  children,
  findRoomById,
}: RoomSelectionProviderProps) {
  const [activeRoom, setActiveRoom] = useState<Room | null | undefined>(null);
  const [activeRoomId, setActiveRoomId] = useState<number | null>(null);
  const [expandReq, setExpandReq] = useState<ExpandReq | null>(null);
  const reqRef = useRef({ room: 0, expand: 0 });
  const skeletonDelayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearSkeletonTimer = () => {
    if (skeletonDelayTimerRef.current !== null) {
      clearTimeout(skeletonDelayTimerRef.current);
      skeletonDelayTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearSkeletonTimer();
  }, []);

  const closeSidePanel = () => {
    reqRef.current.room++;
    clearSkeletonTimer();
    setExpandReq(null);
    setActiveRoomId(null);
  };

  const selectRoom = async (
    roomId: number | null,
    personId?: number | null,
  ): Promise<void> => {
    const roomReqId = ++reqRef.current.room;

    if (roomId === null) {
      closeSidePanel();
      return;
    }

    setActiveRoomId(roomId);
    if (personId != null) {
      setExpandReq({
        reqId: ++reqRef.current.expand,
        personId,
      });
    } else {
      setExpandReq(null);
    }

    if (activeRoom === null) {
      setActiveRoom(undefined);
    }

    if (personId != null && activeRoom?.id === roomId) {
      clearSkeletonTimer();
      return;
    }

    clearSkeletonTimer();
    skeletonDelayTimerRef.current = setTimeout(() => {
      if (reqRef.current.room === roomReqId) {
        setActiveRoom(undefined);
      }
    }, SKELETON_DELAY_MS);

    try {
      const room = await findRoomById(roomId);
      if (reqRef.current.room !== roomReqId) return;

      clearSkeletonTimer();
      setActiveRoom(room);
    } catch (error) {
      if (reqRef.current.room !== roomReqId) return;

      clearSkeletonTimer();
      console.error("Failed to fetch room details:", error);
      setActiveRoom(null);
    }
  };

  const value: RoomSelectionContextType = {
    activeRoom,
    activeRoomId,
    selectRoom,
    closeSidePanel,
    expandReq,
  };

  return (
    <RoomSelectionContext.Provider value={value}>
      {children}
    </RoomSelectionContext.Provider>
  );
}
