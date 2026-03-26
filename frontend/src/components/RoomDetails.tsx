import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { addPerson } from "../services/peopleService";
import type { Room } from "../types";
import AddPersonModal from "./PersonModal";
import "./RoomDetails.css";

function RoomDetails({
  room: roomProp,
  handleClose,
  onPersonAdded,
}: {
  room: Room | null;
  handleClose: () => void;
  onPersonAdded: () => void;
}) {
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const {
    id: roomId,
    name = <Skeleton />,
    area = <Skeleton />,
    capacity = <Skeleton />,
    roomType = <Skeleton />,
    department,
    freeText = <Skeleton />,
    contracts,
  } = (roomProp ?? {}) as Partial<Room>;

  const handleAddPerson = async (values: Record<string, string>) => {
    if (roomId === undefined) {
      return;
    }

    try {
      await addPerson(values, roomId);
      onPersonAdded();
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
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
        <h2 className="room-details-avatar-name">{name}</h2>
      </div>

      <section className="room-details-info">
        <ul>
          <li>Pinta-ala: {area} m²</li>
          <li>Kapasiteetti: {capacity}</li>
          <li>Huonetyyppi: {roomType}</li>
          <li>Osasto: {department?.name ?? <Skeleton />}</li>
          <li>Lisätiedot: {freeText}</li>
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
        {!contracts ? (
          <Skeleton count={3} />
        ) : contracts.length === 0 ? (
          <p>Ei sopimuksia.</p>
        ) : (
          contracts.map((contract) => (
            <details>
              <summary>
                {contract.person.firstName} {contract.person.lastName}
              </summary>
              <ul>
                <li>Osasto: {contract.person.department.name}</li>
                <li>Tutkimusryhmä: {contract.person.researchGroup.name}</li>
                <li>Titteli: {contract.person.title.name}</li>
                <li>
                  Esihenkilöt:{" "}
                  {contract.person.supervisors
                    .map((s) => s.firstName + " " + s.lastName)
                    .join(", ")}
                </li>
                <li>Alkupvm: {contract.startDate}</li>
                <li>Loppupvm: {contract.endDate}</li>
                {contract.person.freeText !== null && (
                  <li>Lisätiedot: {contract.person.freeText}</li>
                )}
              </ul>
            </details>
          ))
        )}
      </section>
    </motion.div>
  );
}

export default RoomDetails;
