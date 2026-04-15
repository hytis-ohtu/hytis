import { useState } from "react";
import type { RoomSelectionContextType } from "../contexts/RoomSelectionContext";
import { RoomSelectionContext } from "../contexts/RoomSelectionContext";
import type { Room } from "../types";

interface RoomSelectionProviderProps {
  children: React.ReactNode;
  findRoomById: (roomId: string) => Promise<Room>;
}

export function RoomSelectionProvider({
  children,
  findRoomById,
}: RoomSelectionProviderProps) {
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [highlightedPersonId, setHighlightedPersonId] = useState<number | null>(
    null,
  );

  const selectRoom = async (roomId: string, personId?: number) => {
    setHighlightedPersonId(personId ?? null);
    try {
      const room = await findRoomById(roomId);
      setActiveRoom(room);
    } catch (error) {
      console.error("Failed to fetch room details:", error);
    }
  };

  const value: RoomSelectionContextType = {
    activeRoom,
    setActiveRoom,
    highlightedPersonId,
    setHighlightedPersonId,
    selectRoom,
  };

  return (
    <RoomSelectionContext.Provider value={value}>
      {children}
    </RoomSelectionContext.Provider>
  );
}
