import { Pencil, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { addPerson, editPerson } from "../services/peopleService";
import type { FieldProps, Person, Room } from "../types";
import PersonModal from "./PersonModal";
import "./RoomDetails.css";

function RoomDetails({
  room: roomProp,
  handleClose,
  onPersonSaved,
}: {
  room: Room | null;
  handleClose: () => void;
  onPersonSaved: () => void;
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
      onPersonSaved();
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
      onPersonSaved();
    } catch (error) {
      console.error("Failed to edit person:", error);
    }
  };

  const Field = ({ label, value }: FieldProps) =>
    value ? (
      <li>
        {label}: {value}
      </li>
    ) : null;

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
            <PersonModal
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
                      department: String(personDetails?.department?.id),
                      jobtitle: String(personDetails?.title?.id),
                      supervisors: personDetails?.supervisors?.length
                        ? personDetails.supervisors
                            .map((s) => String(s.id))
                            .join(",")
                        : "",
                      startDate:
                        contracts?.find((c) => c.person.id === personDetails.id)
                          ?.startDate ?? "",
                      endDate:
                        contracts?.find((c) => c.person.id === personDetails.id)
                          ?.endDate ?? "",
                      researchgroup: String(personDetails?.researchGroup?.id),
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
            <details key={contract.id}>
              <summary>
                <span className="person-name">
                  {contract.person.firstName} {contract.person.lastName}
                </span>
                <span
                  onClick={(e) => e.preventDefault()}
                  className="cursor-gap"
                ></span>
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
                <Field
                  label="Osasto"
                  value={contract.person.department?.name}
                />
                <Field
                  label="Tutkimusryhmä"
                  value={contract.person.researchGroup?.name}
                />
                <Field label="Titteli" value={contract.person.title?.name} />
                {contract.person.supervisors &&
                  contract.person.supervisors.length > 0 && (
                    <li>
                      Esihenkilöt:{" "}
                      {contract.person.supervisors
                        .map((s) => s.firstName + " " + s.lastName)
                        .join(", ")}
                    </li>
                  )}
                <Field label="Alkupvm" value={contract.startDate} />
                <Field label="Loppupvm" value={contract.endDate} />
                <Field label="Lisätiedot" value={contract.person.freeText} />
              </ul>
            </details>
          ))
        )}
      </section>
    </motion.div>
  );
}

export default RoomDetails;
