import { createContext } from "react";
import type { Room } from "../types";

export interface ExpandReq {
  reqId: number;
  personId: number;
}

export interface RoomSelectionContextType {
  activeRoom: Room | null | undefined;
  selectRoom: (
    roomId: number | null,
    personId?: number | null,
  ) => Promise<void>;
  displayedRoomId: number | null;
  closeSidePanel: () => void;
  handleSidePanelExited: () => void;
  expandReq: ExpandReq | null;
}

export const RoomSelectionContext =
  createContext<RoomSelectionContextType | null>(null);
