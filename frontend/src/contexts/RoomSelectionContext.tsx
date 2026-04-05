import { createContext, useContext, useState, Dispatch, SetStateAction } from "react";
import type { Room } from "../types";

interface RoomSelectionContextType {
  activeRoomId: string | null;
  setActiveRoomId: Dispatch<SetStateAction<string | null>>;
  isRoomDetailsOpen: boolean;
  setIsRoomDetailsOpen: Dispatch<SetStateAction<boolean>>;
  room: Room | null;
  setRoom: Dispatch<SetStateAction<Room | null>>;
  selectRoom: (roomId: string, personId?: number) => Promise<void>;
  selectedPersonId: number | null;
}

export const RoomSelectionContext = createContext<RoomSelectionContextType | null>(null);

export function useRoomSelection(): RoomSelectionContextType {
  const context = useContext(RoomSelectionContext);
  if (!context) {
    throw new Error("useRoomSelection must be used within RoomSelectionProvider");
  }
  return context;
}

interface RoomSelectionProviderProps {
  children: React.ReactNode;
  fetchRoomById: (roomId: string) => Promise<Room>;
}

export function RoomSelectionProvider({ children, fetchRoomById }: RoomSelectionProviderProps) {
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isRoomDetailsOpen, setIsRoomDetailsOpen] = useState<boolean>(false);
  const [room, setRoom] = useState<Room | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Helper function to select a room and fetch its details
  const selectRoom = async (roomId: string, personId?: number) => {
    setActiveRoomId(roomId);
    setIsRoomDetailsOpen(true);
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
    isRoomDetailsOpen,
    setIsRoomDetailsOpen,
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
