import { useContext } from "react";
import type { RoomSelectionContextType } from "../contexts/RoomSelectionContext";
import { RoomSelectionContext } from "../contexts/RoomSelectionContext";

export function useRoomSelection(): RoomSelectionContextType {
  const context = useContext(RoomSelectionContext);
  if (!context) {
    throw new Error(
      "useRoomSelection must be used within RoomSelectionProvider",
    );
  }
  return context;
}
