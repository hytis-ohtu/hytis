import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Room } from "../types";
import AddPersonModal from "./PersonModal";
import "./RoomDetails.css";

function RoomDetails({
  room,
  handleClose,
  onPersonAdded,
}: {
  room: Room | null;
  handleClose: () => void;
  onPersonAdded: () => void;
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

    onPersonAdded();
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

      <section className="room-details-info">
        <ul>
          <li>Pinta-ala: {room.area} m²</li>
          <li>Kapasiteetti: {room.capacity}</li>
          <li>Huonetyyppi: {room.roomType}</li>
          <li>Osasto: {room.department.name}</li>
          <li>Lisätiedot: {room.freeText}</li>
        </ul>
      </section>

      <section className="person-details-info">
        <div className="person-details-header">
          <h2>Henkilöt</h2>
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
        {room.contracts.length === 0 ? (
          <p>Ei sopimuksia.</p>
        ) : (
          room.contracts.map((contract) => (
            <details>
              <summary>
                {contract.person.firstName} {contract.person.lastName}
              </summary>
              <ul>
                <li>Osasto: {contract.person.department.name}</li>
                <li>Titteli: {contract.person.title.name}</li>
                <li>Alkupvm: {contract.startDate}</li>
                <li>Loppupvm: {contract.endDate}</li>
              </ul>
            </details>
          ))
        )}
      </section>
    </motion.div>
  );
}

export default RoomDetails;
