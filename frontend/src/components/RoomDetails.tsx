import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Room } from "../types";
import AddPersonModal from "./PersonModal";
import "./RoomDetails.css";

function RoomDetails({
  room,
  handleClose,
}: {
  room: Room | null;
  handleClose: () => void;
}) {
  const [addPersonOpen, setAddPersonOpen] = useState(false);

  const handleAddPerson = async (values: Record<string, string>) => {
    const response = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        // TODO: needs routes
        //departmentId: values.department,
        //titleId: values.jobtitle,
        //supervisorIds: values.supervisors,
        //researchGroupId: values.researchgroup,
        freeText: values.misc,
        startDate: values.startDate,
        endDate: values.endDate,
      }),
    });

    if (!response.ok) {
      console.error("Failed to create person");
      return;
    }

    setAddPersonOpen(false);
  };

  if (!room) {
    return null;
  }

  return (
    <motion.div
      initial={{ x: "100vw" }}
      animate={{ x: 0 }}
      exit={{ x: "100vw" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="room-details"
    >
      <header className="room-details-header">
        <h1 className="room-details-title">Huone</h1>
        <X
          data-testid="close-room-details-panel"
          className="room-details-close-button"
          onClick={handleClose}
        />
      </header>

      <div className="room-details-avatar">
        <h2 className="room-details-avatar-name">{room.name}</h2>
      </div>
      <div className="room-details-info">
        <button
          className="room-details-button"
          onClick={() => setAddPersonOpen(true)}
        >
          Lisää henkilö
        </button>
        {addPersonOpen && (
          <AddPersonModal
            onClose={() => setAddPersonOpen(false)}
            onSubmit={handleAddPerson}
          />
        )}
      </div>

      <section className="room-details-info">
        <h1>Tiedot</h1>
        <ul>
          <li>Pinta-ala: {room.area} m²</li>
          <li>Kapasiteetti: {room.capacity}</li>
          <li>Huonetyyppi: {room.roomType}</li>
          <li>Osasto: {room.department.name}</li>
          <li>Lisätiedot: {room.freeText}</li>
        </ul>
      </section>
    </motion.div>
  );
}

export default RoomDetails;
