import type { RoomSelectionContextType } from "@contexts/RoomSelectionContext";
import { RoomSelectionContext } from "@contexts/RoomSelectionContext";
import { useContext } from "react";

export function useRoomSelection(): RoomSelectionContextType {
  const context = useContext(RoomSelectionContext);
  if (!context) {
    throw new Error(
      "useRoomSelection must be used within RoomSelectionProvider",
    );
  }
  return context;
}
