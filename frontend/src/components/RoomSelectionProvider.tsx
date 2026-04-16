import { useEffect, useRef, useState } from "react";
import type { RoomSelectionContextType } from "../contexts/RoomSelectionContext";
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
  const [displayedRoomId, setDisplayedRoomId] = useState<number | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<number | null>(
    null,
  );
  const requestIdRef = useRef(0);
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
    requestIdRef.current++;
    clearSkeletonTimer();
    setHighlightedPersonId(null);
    setDisplayedRoomId(null);
  };

  const handleSidePanelExited = () => {
    if (displayedRoomId !== null) return;
    setActiveRoom(null);
  };

  const selectRoom = async (
    roomId: number | null,
    personId?: number | null,
  ) => {
    const requestId = ++requestIdRef.current;

    if (roomId === null) {
      closeSidePanel();
      return;
    }

    setDisplayedRoomId(roomId);
    setHighlightedPersonId(personId ?? null);
    clearSkeletonTimer();
    skeletonDelayTimerRef.current = setTimeout(() => {
      if (requestIdRef.current === requestId) {
        setActiveRoom(undefined);
      }
    }, SKELETON_DELAY_MS);

    try {
      const room = await findRoomById(roomId);
      if (requestIdRef.current !== requestId) return;

      clearSkeletonTimer();
      setActiveRoom(room);
    } catch (error) {
      if (requestIdRef.current !== requestId) return;

      clearSkeletonTimer();
      console.error("Failed to fetch room details:", error);
      setActiveRoom(null);
    }
  };

  const value: RoomSelectionContextType = {
    activeRoom,
    displayedRoomId,
    selectRoom,
    closeSidePanel,
    handleSidePanelExited,
    highlightedPersonId,
    setHighlightedPersonId,
  };

  return (
    <RoomSelectionContext.Provider value={value}>
      {children}
    </RoomSelectionContext.Provider>
  );
}
