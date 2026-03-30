import { Pencil, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { addPerson, editPerson } from "../services/peopleService";
import type { Person, Room } from "../types";
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
  const [personDetails, setPersonDetails] = useState<Person | null>(null);
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

  const handleEditPerson = async (values: Record<string, string>) => {
    if (roomId === undefined || personDetails?.id === undefined) {
      return;
    }

    try {
      await editPerson(personDetails.id, values, roomId);
      onPersonAdded();
    } catch (error) {
      console.error("Failed to edit person:", error);
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
              onClose={() => {
                setAddPersonOpen(false);
                setPersonDetails(null);
              }}
              onSubmit={personDetails ? handleEditPerson : handleAddPerson}
              initial={
                personDetails
                  ? {
                      firstName: personDetails.firstName,
                      lastName: personDetails.lastName,
                      department: String(personDetails.department.id),
                      jobtitle: String(personDetails.title.id),
                      supervisors: "",
                      startDate:
                        contracts?.find((c) => c.person.id === personDetails.id)
                          ?.startDate ?? "",
                      endDate:
                        contracts?.find((c) => c.person.id === personDetails.id)
                          ?.endDate ?? "",
                      researchgroup: String(personDetails.researchGroup.id),
                      misc: personDetails.freeText ?? "",
                    }
                  : {}
              }
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
                <Pencil
                  data-testid={`edit-person-button-${contract.person.id}`}
                  size={16}
                  onClick={(event) => {
                    event.preventDefault();
                    setPersonDetails(contract.person);
                    setAddPersonOpen(true);
                  }}
                  className="edit-person-button"
                />
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
