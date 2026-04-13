import { useState } from "react";
import type { Room } from "../types";
import type { RoomSelectionContextType } from "../contexts/RoomSelectionContext";
import { RoomSelectionContext } from "../contexts/RoomSelectionContext";

interface RoomSelectionProviderProps {
  children: React.ReactNode;
  fetchRoomById: (roomId: string) => Promise<Room>;
}

export function RoomSelectionProvider({ children, fetchRoomById }: RoomSelectionProviderProps) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Helper function to select a room and fetch its details
  const selectRoom = async (roomId: string, personId?: number) => {
    setActiveRoomId(roomId);
    setIsSidePanelOpen(true);
    setSelectedPersonId(personId ?? null);
    try {
      const roomData = await fetchRoomById(roomId);
      setRoom(roomData);
    } catch (error) {
      console.error("❌ Failed to fetch room details:", error);
    }
  };

  const value: RoomSelectionContextType = {
    activeRoomId,
    setActiveRoomId,
    isSidePanelOpen,
    setIsSidePanelOpen,
    room,
    setRoom,
    selectRoom,
    selectedPersonId,
  };

  return (
    <RoomSelectionContext.Provider value={value}>
      {children}
    </RoomSelectionContext.Provider>
  );
}
