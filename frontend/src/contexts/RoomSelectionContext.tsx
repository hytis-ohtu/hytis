import { createContext } from "react";
import type { Room } from "../types";

export interface RoomSelectionContextType {
  activeRoom: Room | null;
  setActiveRoom: (value: React.SetStateAction<Room | null>) => void;
  highlightedPersonId: number | null;
  setHighlightedPersonId: (value: React.SetStateAction<number | null>) => void;
  selectRoom: (roomId: string, personId?: number) => Promise<void>;
}

export const RoomSelectionContext =
  createContext<RoomSelectionContextType | null>(null);
