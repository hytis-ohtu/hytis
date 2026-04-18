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
    refresh?: boolean,
  ) => Promise<void>;
  activeRoomId: number | null;
  expandReq: ExpandReq | null;
}

export const RoomSelectionContext =
  createContext<RoomSelectionContextType | null>(null);
