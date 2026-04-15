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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
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
    setIsSidePanelOpen(false);
  };

  const handleSidePanelExited = () => {
    if (isSidePanelOpen) return;
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

    setIsSidePanelOpen(true);
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
    isSidePanelOpen,
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
