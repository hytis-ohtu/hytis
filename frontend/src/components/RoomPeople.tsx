import { ChevronDown, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { removeContract } from "../services/contractsService";
import { addPerson, editPerson } from "../services/peopleService";
import type { Contract, Person, Room } from "../types";
import ConfirmationDialog from "./ConfirmationDialog";
import PersonModal from "./PersonModal";
import "./SidePanel.css";

interface RoomPeopleProps {
  room: Room;
  onPersonSaved: () => void;
}

function RoomPeople({ room, onPersonSaved }: RoomPeopleProps) {
  const { id: roomId, contracts } = room;

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [contractToRemove, setContractToRemove] = useState<Contract | null>(
    null,
  );

  const handleAddPerson = async (values: Record<string, string>) => {
    if (roomId === undefined) return;
    try {
      await addPerson(values, roomId);
      onPersonSaved();
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  const handleEditPerson = async (values: Record<string, string>) => {
    if (roomId === undefined || selectedPerson?.id === undefined) return;
    try {
      await editPerson(selectedPerson.id, values, roomId);
      onPersonSaved();
    } catch (error) {
      console.error("Failed to edit person:", error);
    }
  };

  const handleRemoveContract = async () => {
    if (!contractToRemove) return;
    try {
      await removeContract(contractToRemove.id);
      onPersonSaved();
    } catch (error) {
      console.error("Failed to remove contract:", error);
    } finally {
      setContractToRemove(null);
    }
  };

  return (
    <section className="room-people">
      {/* Header */}
      <header>
        <Users />
        <h2>Henkilöt</h2>
        <ChevronDown />
        <button className="button-icon" onClick={() => setAddPersonOpen(true)}>
          <Plus />
        </button>
      </header>

      {/* Contracts */}
      {!contracts ? (
        <Skeleton count={3} />
      ) : !contracts.length ? (
        <p>Ei henkilöitä.</p>
      ) : (
        <div className="contracts">
          {contracts.map((contract) => (
            <article className="contract" key={contract.id}>
              <header>
                <div>
                  <p>
                    {contract.person.lastName} {contract.person.firstName}
                  </p>
                  <button className="button-icon">
                    <ChevronDown size={18} />
                  </button>
                </div>
                <div>
                  <button
                    className="button-icon edit-person"
                    onClick={() => {
                      setSelectedPerson(contract.person);
                      setAddPersonOpen(true);
                    }}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="button-icon remove-contract"
                    onClick={() => setContractToRemove(contract)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </header>
              <ul>
                <li>
                  <p>Osasto: {contract.person.department?.name}</p>
                </li>
                <li>
                  <p>Tutkimusryhmä: {contract.person.researchGroup?.name}</p>
                </li>
                <li>
                  <p>Titteli: {contract.person.title?.name}</p>
                </li>
                {contract.person.supervisors &&
                  contract.person.supervisors.length > 0 && (
                    <li>
                      Esihenkilöt:{" "}
                      {contract.person.supervisors
                        .map((s) => s.firstName + " " + s.lastName)
                        .join(", ")}
                    </li>
                  )}
                <li>
                  <p>Alkupvm: {contract.startDate}</p>
                </li>
                <li>
                  <p>Loppupvm: {contract.endDate}</p>
                </li>
                <li>
                  <p>Lisätiedot: {contract.person.freeText}</p>
                </li>
              </ul>
            </article>
          ))}
        </div>
      )}

      {/* Person Modal */}
      {addPersonOpen && (
        <PersonModal
          onClose={() => {
            setAddPersonOpen(false);
            setSelectedPerson(null);
          }}
          onSubmit={selectedPerson ? handleEditPerson : handleAddPerson}
          initial={
            selectedPerson
              ? {
                  firstName: selectedPerson.firstName,
                  lastName: selectedPerson.lastName,
                  department: String(selectedPerson.department?.id),
                  jobtitle: String(selectedPerson.title?.id),
                  supervisors: selectedPerson.supervisors?.length
                    ? selectedPerson.supervisors
                        .map((s) => String(s.id))
                        .join(",")
                    : "",
                  startDate:
                    contracts?.find((c) => c.person.id === selectedPerson.id)
                      ?.startDate ?? "",
                  endDate:
                    contracts?.find((c) => c.person.id === selectedPerson.id)
                      ?.endDate ?? "",
                  researchgroup: String(selectedPerson?.researchGroup?.id),
                  misc: selectedPerson.freeText ?? "",
                }
              : {}
          }
        />
      )}

      {/* Confirmation Button */}
      <ConfirmationDialog
        open={contractToRemove !== null}
        title={`Poista ${contractToRemove?.person.firstName} ${contractToRemove?.person.lastName}?`}
        confirmText="Poista"
        cancelText="Peruuta"
        onConfirm={handleRemoveContract}
        onCancel={() => setContractToRemove(null)}
      />
    </section>
  );
}

export default RoomPeople;
