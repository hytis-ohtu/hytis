import { ChevronDown, Plus, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useReducer } from "react";
import Skeleton from "react-loading-skeleton";
import { useRoomSelection } from "../../../hooks/useRoomSelection";
import {
  createContract,
  removeContract,
} from "../../../services/contractsService";
import { addPerson, editPerson } from "../../../services/peopleService";
import type { Person, RoomContract } from "../../../types";
import { EXPAND_COLLAPSE_TRANSITION } from "../../../utils/motionTransitions";
import { renderValue } from "../../../utils/renderValue";
import ConfirmationDialog from "../../ConfirmationDialog";
import PersonModal from "../../PersonModal";
import RoomPersonCard from "./RoomPersonCard";
import "./SidePanel.css";

let seenExpandReqId: number | null = null;

type RoomPeopleProps = {
  onRoomUpdate: () => Promise<void>;
};

type State = {
  activePerson: Person | null;
  addPersonOpen: boolean;
  contractsCollapsed: boolean;
  contractToRemove: RoomContract | null;
};

type Action =
  | { type: "toggle-contracts" }
  | { type: "open-add-person" }
  | { type: "open-edit-person"; person: Person }
  | { type: "close-person-modal" }
  | { type: "request-remove-contract"; contract: RoomContract }
  | { type: "cancel-remove-contract" };

const initialState: State = {
  activePerson: null,
  addPersonOpen: false,
  contractsCollapsed: false,
  contractToRemove: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "toggle-contracts":
      return {
        ...state,
        contractsCollapsed: !state.contractsCollapsed,
      };
    case "open-add-person":
      return {
        ...state,
        activePerson: null,
        addPersonOpen: true,
      };
    case "open-edit-person":
      return {
        ...state,
        activePerson: action.person,
        addPersonOpen: true,
      };
    case "close-person-modal":
      return {
        ...state,
        activePerson: null,
        addPersonOpen: false,
      };
    case "request-remove-contract":
      return {
        ...state,
        contractToRemove: action.contract,
      };
    case "cancel-remove-contract":
      return {
        ...state,
        contractToRemove: null,
      };
    default:
      return state;
  }
}

function RoomPeople({ onRoomUpdate }: RoomPeopleProps) {
  const { activeRoom, selectRoom, expandReq } = useRoomSelection();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (expandReq === null) {
      return;
    }

    if (seenExpandReqId === expandReq.reqId) {
      return;
    }

    const highlightedPersonIsInActiveRoom = activeRoom?.contracts?.some(
      (contract) => contract.person.id === expandReq.personId,
    );

    if (!highlightedPersonIsInActiveRoom) {
      return;
    }

    if (state.contractsCollapsed) {
      dispatch({ type: "toggle-contracts" });
    }
    seenExpandReqId = expandReq.reqId;
  }, [activeRoom?.contracts, expandReq, state.contractsCollapsed]);

  const handlePersonSubmit = async (values: Record<string, string>) => {
    if (activeRoom?.id === undefined) return;

    try {
      if (state.activePerson) {
        await editPerson(state.activePerson.id, values, activeRoom.id);
      } else if (values.personId) {
        await createContract(
          Number(values.personId),
          activeRoom.id,
          values.startDate || null,
          values.endDate || null,
        );
      } else {
        await addPerson(values, activeRoom.id);
      }

      dispatch({ type: "close-person-modal" });
      void onRoomUpdate();
      void selectRoom(activeRoom.id);
    } catch (error) {
      console.error(
        state.activePerson ? "Failed to edit person:" : "Failed to add person:",
        error,
      );
    }
  };

  const submitPerson = (values: Record<string, string>) => {
    void handlePersonSubmit(values);
  };

  const handleRemoveContract = async () => {
    if (activeRoom?.id === undefined || !state.contractToRemove) return;

    try {
      await removeContract(state.contractToRemove.id);
      void onRoomUpdate();
      void selectRoom(activeRoom.id);
    } catch (error) {
      console.error("Failed to remove contract:", error);
    } finally {
      dispatch({ type: "cancel-remove-contract" });
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
          onClick={() => dispatch({ type: "toggle-contracts" })}
          aria-label={
            state.contractsCollapsed
              ? "Avaa huoneen henkilöt"
              : "Sulje huoneen henkilöt"
          }
          aria-expanded={!state.contractsCollapsed}
        >
          <ChevronDown
            className={
              state.contractsCollapsed
                ? "collapse-icon collapsed"
                : "collapse-icon"
            }
          />
        </button>
        <button
          className="button-icon"
          aria-label="Sijoita henkilö huoneeseen"
          onClick={() => dispatch({ type: "open-add-person" })}
        >
          <Plus />
        </button>
      </header>

      {/* Contracts */}
      <AnimatePresence initial={false}>
        {!state.contractsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={EXPAND_COLLAPSE_TRANSITION}
            style={{ overflow: "hidden" }}
            className={
              activeRoom?.contracts === undefined
                ? "contracts contracts-skeleton"
                : "contracts"
            }
          >
            {activeRoom?.contracts === undefined ? (
              <Skeleton count={6} />
            ) : activeRoom.contracts.length === 0 ? (
              <div className="no-contracts">
                <p>Ei henkilöitä.</p>
              </div>
            ) : (
              activeRoom.contracts.map((contract) => (
                <RoomPersonCard
                  key={contract.id}
                  contract={contract}
                  onEdit={() => {
                    dispatch({
                      type: "open-edit-person",
                      person: contract.person,
                    });
                  }}
                  onRemove={() =>
                    dispatch({ type: "request-remove-contract", contract })
                  }
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Person Modal */}
      {state.addPersonOpen && (
        <PersonModal
          onClose={() => {
            dispatch({ type: "close-person-modal" });
          }}
          onSubmit={submitPerson}
          initial={
            state.activePerson
              ? {
                  firstName: state.activePerson.firstName,
                  lastName: state.activePerson.lastName,
                  department: String(state.activePerson.department?.id),
                  jobtitle: String(state.activePerson.title?.id),
                  supervisors: state.activePerson.supervisors?.length
                    ? state.activePerson.supervisors
                        .map((s) => String(s.id))
                        .join(",")
                    : "",
                  startDate:
                    activeRoom?.contracts?.find(
                      (c) => c.person.id === state.activePerson?.id,
                    )?.startDate ?? "",
                  endDate:
                    activeRoom?.contracts?.find(
                      (c) => c.person.id === state.activePerson?.id,
                    )?.endDate ?? "",
                  researchgroup: String(state.activePerson?.researchGroup?.id),
                  misc: state.activePerson.freeText ?? "",
                }
              : {}
          }
        />
      )}

      {/* Confirmation Button */}
      <ConfirmationDialog
        open={state.contractToRemove !== null}
        title={`Poista ${state.contractToRemove?.person.firstName} ${state.contractToRemove?.person.lastName}?`}
        confirmText="Poista"
        cancelText="Peruuta"
        onConfirm={() => void handleRemoveContract()}
        onCancel={() => dispatch({ type: "cancel-remove-contract" })}
      />
    </section>
  );
}

export default RoomPeople;
