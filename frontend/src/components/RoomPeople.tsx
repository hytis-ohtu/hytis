import { ChevronDown, Pencil, Plus, Trash2, Users } from "lucide-react";
import { useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { removeContract } from "../services/contractsService";
import { addPerson, editPerson } from "../services/peopleService";
import type { Contract, Person } from "../types";
import ConfirmationDialog from "./ConfirmationDialog";
import PersonModal from "./PersonModal";
import "./SidePanel.css";

function RoomPeople() {
  const { activeRoom, selectRoom, highlightedPersonId } = useRoomSelection();

  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [contractToRemove, setContractToRemove] = useState<Contract | null>(
    null,
  );

  const handleAddPerson = async (values: Record<string, string>) => {
    if (activeRoom?.id === undefined) return;
    try {
      await addPerson(values, activeRoom.id);
      selectRoom(activeRoom.id);
    } catch (error) {
      console.error("Failed to add person:", error);
    }
  };

  const handleEditPerson = async (values: Record<string, string>) => {
    if (activeRoom?.id === undefined || highlightedPersonId === null) return;
    try {
      await editPerson(highlightedPersonId, values, activeRoom.id);
      selectRoom(activeRoom.id);
    } catch (error) {
      console.error("Failed to edit person:", error);
    }
  };

  const handleRemoveContract = async () => {
    if (activeRoom?.id === undefined || !contractToRemove) return;
    try {
      await removeContract(contractToRemove.id);
      selectRoom(activeRoom.id);
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
      {activeRoom?.contracts === undefined ? (
        <div className="contracts contracts-skeleton">
          <Skeleton count={6} />
        </div>
      ) : activeRoom?.contracts === null ? (
        <p>Ei henkilöitä.</p>
      ) : (
        <div className="contracts">
          {activeRoom.contracts.map((contract) => (
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
                      setActivePerson(contract.person);
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
            setActivePerson(null);
          }}
          onSubmit={activePerson ? handleEditPerson : handleAddPerson}
          initial={
            activePerson
              ? {
                  firstName: activePerson.firstName,
                  lastName: activePerson.lastName,
                  department: String(activePerson.department?.id),
                  jobtitle: String(activePerson.title?.id),
                  supervisors: activePerson.supervisors?.length
                    ? activePerson.supervisors
                        .map((s) => String(s.id))
                        .join(",")
                    : "",
                  startDate:
                    activeRoom?.contracts?.find(
                      (c) => c.person.id === activePerson.id,
                    )?.startDate ?? "",
                  endDate:
                    activeRoom?.contracts?.find(
                      (c) => c.person.id === activePerson.id,
                    )?.endDate ?? "",
                  researchgroup: String(activePerson?.researchGroup?.id),
                  misc: activePerson.freeText ?? "",
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
