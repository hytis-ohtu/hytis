import { ChevronDown, Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { useRoomSelection } from "../hooks/useRoomSelection";
import { removeContract } from "../services/contractsService";
import { addPerson, editPerson } from "../services/peopleService";
import type { Contract, Person } from "../types";
import { renderValue } from "../utils/renderValue";
import ConfirmationDialog from "./ConfirmationDialog";
import PersonModal from "./PersonModal";
import RoomPersonCard from "./RoomPersonCard";
import "./SidePanel.css";

function RoomPeople() {
  const { activeRoom, selectRoom, expandReq } = useRoomSelection();

  const [activePerson, setActivePerson] = useState<Person | null>(null);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [contractsCollapsed, setContractsCollapsed] = useState(false);
  const seenReqIdRef = useRef<number | null>(null);
  const [contractToRemove, setContractToRemove] = useState<Contract | null>(
    null,
  );

  const toggleContracts = () => setContractsCollapsed((previous) => !previous);

  useEffect(() => {
    if (expandReq === null) {
      return;
    }

    if (seenReqIdRef.current === expandReq.reqId) {
      return;
    }

    const highlightedPersonIsInActiveRoom = activeRoom?.contracts?.some(
      (contract) => contract.person.id === expandReq.personId,
    );

    if (!highlightedPersonIsInActiveRoom) {
      return;
    }

    setContractsCollapsed(false);
    seenReqIdRef.current = expandReq.reqId;
  }, [activeRoom?.contracts, expandReq]);

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
    if (activeRoom?.id === undefined || activePerson === null) return;
    try {
      await editPerson(activePerson.id, values, activeRoom.id);
      setActivePerson(null);
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
        <h2>
          Henkilöt
          {renderValue(
            activeRoom?.contracts.length,
            "(0)",
            (value) => ` (${value})`,
            {
              skeletonProps: {
                width: "3ch",
                style: { marginLeft: "0.5rem" },
              },
            },
          )}
        </h2>
        <button
          className="button-icon"
          onClick={toggleContracts}
          aria-label={
            contractsCollapsed
              ? "Avaa huoneen henkilöt"
              : "Sulje huoneen henkilöt"
          }
          aria-expanded={!contractsCollapsed}
        >
          <ChevronDown
            className={
              contractsCollapsed ? "collapse-icon collapsed" : "collapse-icon"
            }
          />
        </button>
        <button className="button-icon" onClick={() => setAddPersonOpen(true)}>
          <Plus />
        </button>
      </header>

      {/* Contracts */}
      <AnimatePresence initial={false}>
        {!contractsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            {activeRoom?.contracts === undefined ? (
              <div className="contracts contracts-skeleton">
                <Skeleton count={6} />
              </div>
            ) : activeRoom?.contracts === null ? (
              <p>Ei henkilöitä.</p>
            ) : (
              <div className="contracts">
                {activeRoom.contracts.map((contract) => (
                  <RoomPersonCard
                    key={contract.id}
                    contract={contract}
                    onEdit={() => {
                      setActivePerson(contract.person);
                      setAddPersonOpen(true);
                    }}
                    onRemove={() => setContractToRemove(contract)}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
