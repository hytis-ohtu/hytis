import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { addPerson } from "../services/peopleService";
import type { FieldProps, Room } from "../types";
import AddPersonModal from "./PersonModal";
import "./SidePanel.css";

function PeopleSidePanel({
  room: roomProp,
  onPersonAdded,
}: {
  room: Room | null;
  onPersonAdded: () => void;
}) {
  const { id: roomId, contracts } = (roomProp ?? {}) as Partial<Room>;

  const [addPersonOpen, setAddPersonOpen] = useState(false);

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

  const Field = ({ label, value }: FieldProps) =>
    value ? (
      <li>
        {label}: {value}
      </li>
    ) : null;

  return (
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
              <Field label="Osasto" value={contract.person.department?.name} />
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
  );
}

export default PeopleSidePanel;
