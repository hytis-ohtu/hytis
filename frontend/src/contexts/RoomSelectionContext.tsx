import { createContext } from "react";
import type { Room } from "../types";

export interface RoomSelectionContextType {
  activeRoomId: string | null;
  setActiveRoomId: (value: React.SetStateAction<string | null>) => void;
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (value: React.SetStateAction<boolean>) => void;
  room: Room | null;
  setRoom: (value: React.SetStateAction<Room | null>) => void;
  selectRoom: (roomId: string, personId?: number) => Promise<void>;
  selectedPersonId: number | null;
}

export const RoomSelectionContext = createContext<RoomSelectionContextType | null>(null);
