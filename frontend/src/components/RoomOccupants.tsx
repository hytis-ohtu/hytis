import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { createContract, removeContract } from "../services/contractsService";
import { addPerson, editPerson } from "../services/peopleService";
import type { Contract, FieldProps, Person, Room } from "../types";
import ConfirmationDialog from "./ConfirmationDialog";
import PersonModal from "./PersonModal";
import "./SidePanel.css";

function RoomOccupants({
  room: roomProp,
  onPersonSaved,
  selectedPersonId,
}: {
  room: Room | null;
  onPersonSaved: () => void;
  selectedPersonId: number | null;
}) {
  const { id: roomId, contracts } = (roomProp ?? {}) as Partial<Room>;

  const [personDetails, setPersonDetails] = useState<Person | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [contractToRemove, setContractToRemove] = useState<Contract | null>(
    null,
  );

  const handleAddPerson = async (values: Record<string, string>) => {
    if (roomId === undefined) return;
    try {
      if (values.personId) {
        await createContract(
          Number(values.personId),
          Number(roomId),
          values.startDate || null,
          values.endDate || null,
        );
      } else {
        await addPerson(values, roomId);
      }
      onPersonSaved();
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  const handleEditPerson = async (values: Record<string, string>) => {
    if (roomId === undefined || personDetails?.id === undefined) return;
    try {
      await editPerson(personDetails.id, values, roomId);
      onPersonSaved();
    } catch (error) {
      console.error("Failed to edit person:", error);
    }
  };

  const handleRemoveContract = async () => {
    if (contractToRemove === null) return;
    try {
      await removeContract(contractToRemove.id);
      onPersonSaved();
    } catch (error) {
      console.error("Failed to remove contract:", error);
    } finally {
      setContractToRemove(null);
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
                      contracts?.find((c) => c.person?.id === personDetails.id)
                        ?.startDate ?? "",
                    endDate:
                      contracts?.find((c) => c.person?.id === personDetails.id)
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
        contracts.map((contract) =>
          contract.person ? (
            <details
              key={contract.id}
              open={contract.person.id === selectedPersonId}
            >
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
                    setPersonDetails(contract.person ?? null);
                    setAddPersonOpen(true);
                  }}
                  className="edit-person-button"
                />
                <span
                  onClick={(e) => e.preventDefault()}
                  className="cursor-gap"
                ></span>
                <Trash2
                  data-testid={`remove-person-button-${contract.person.id}`}
                  size={16}
                  onClick={(event) => {
                    event.preventDefault();
                    setContractToRemove(contract);
                  }}
                  className="remove-person-button"
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
          ) : null,
        )
      )}

      <ConfirmationDialog
        open={contractToRemove !== null}
        title={`Poista ${contractToRemove?.person?.firstName ?? ""} ${contractToRemove?.person?.lastName ?? ""}?`}
        confirmText="Poista"
        cancelText="Peruuta"
        onConfirm={handleRemoveContract}
        onCancel={() => setContractToRemove(null)}
      />
    </section>
  );
}

export default RoomOccupants;
