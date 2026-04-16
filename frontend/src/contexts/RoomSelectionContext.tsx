import { createContext } from "react";
import type { Room } from "../types";

export interface RoomSelectionContextType {
  activeRoom: Room | null | undefined;
  selectRoom: (
    roomId: number | null,
    personId?: number | null,
  ) => Promise<void>;
  displayedRoomId: number | null;
  closeSidePanel: () => void;
  handleSidePanelExited: () => void;
  highlightedPersonId: number | null;
  setHighlightedPersonId: (value: React.SetStateAction<number | null>) => void;
}

export const RoomSelectionContext =
  createContext<RoomSelectionContextType | null>(null);
