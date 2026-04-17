import { ChevronDown, Pencil, Trash2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRoomSelection } from "../hooks/useRoomSelection";
import type { Contract } from "../types";
import {
  formatContractDate,
  formatContractStatus,
  getContractDateMeta,
} from "../utils/contractDates";
import { EXPAND_COLLAPSE_TRANSITION } from "../utils/motionTransitions";
import { renderValue } from "../utils/renderValue";

let seenExpandReqId: number | null = null;

interface RoomPersonCardProps {
  contract: Contract;
  onEdit: () => void;
  onRemove: () => void;
}

function RoomPersonCard({ contract, onEdit, onRemove }: RoomPersonCardProps) {
  const { expandReq } = useRoomSelection();
  const [detailsCollapsed, setDetailsCollapsed] = useState(true);
  const contractDateMeta = getContractDateMeta(
    contract.startDate,
    contract.endDate,
  );

  const timelineProgress = contractDateMeta.progress;
  const contractStatus = formatContractStatus(contractDateMeta);

  const toggleDetails = () => setDetailsCollapsed((previous) => !previous);

  useEffect(() => {
    if (expandReq === null) {
      return;
    }

    if (seenExpandReqId === expandReq.reqId) {
      return;
    }

    if (expandReq.personId !== contract.person.id) {
      return;
    }

    setDetailsCollapsed(false);
    seenExpandReqId = expandReq.reqId;
  }, [contract.person.id, expandReq]);

  return (
    <article className="contract">
      <header>
        {/* Main Header */}
        <div className="contract-header-main">
          <User size={18} />
          <h3>
            {contract.person.lastName} {contract.person.firstName}
          </h3>
          <button
            className="button-icon"
            onClick={toggleDetails}
            aria-label={
              detailsCollapsed
                ? "Avaa henkilön tiedot"
                : "Sulje henkilön tiedot"
            }
            aria-expanded={!detailsCollapsed}
          >
            <ChevronDown
              size={18}
              className={
                detailsCollapsed ? "collapse-icon collapsed" : "collapse-icon"
              }
            />
          </button>
          <button className="button-icon" onClick={onEdit}>
            <Pencil size={18} />
          </button>
          <button className="button-icon" onClick={onRemove}>
            <Trash2 size={18} />
          </button>
        </div>

        {/* Timeline */}
        <div
          className="contract-timeline"
          style={
            {
              "--timeline-progress": `${timelineProgress * 100}%`,
            } as CSSProperties
          }
        >
          <p className="contract-timeline-date">
            {formatContractDate(contractDateMeta.startDate)}
          </p>
          <div className="contract-timeline-track" aria-hidden="true">
            <div className="contract-timeline-fill" />
            <span className="contract-timeline-status">{contractStatus}</span>
          </div>
          <p className="contract-timeline-date">
            {formatContractDate(contractDateMeta.endDate)}
          </p>
        </div>
      </header>

      {/* Person Details */}
      <AnimatePresence initial={false}>
        {!detailsCollapsed && (
          <motion.dl
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={EXPAND_COLLAPSE_TRANSITION}
            style={{ overflow: "hidden" }}
            className="person-details"
          >
            <div className="person-detail">
              <dt className="entry-label">Osasto</dt>
              <dd className="entry-value">
                {renderValue(contract.person.department?.name)}
              </dd>
            </div>
            <div className="person-detail">
              <dt className="entry-label">Titteli</dt>
              <dd className="entry-value">
                {renderValue(contract.person.title?.name)}
              </dd>
            </div>
            <div className="person-detail">
              <dt className="entry-label">Tutkimusryhmä</dt>
              <dd className="entry-value">
                {renderValue(contract.person.researchGroup?.name)}
              </dd>
            </div>
            <div className="person-detail">
              <dt className="entry-label">Esihenkilöt</dt>
              <dd className="entry-value">
                {renderValue(
                  contract.person.supervisors?.length
                    ? contract.person.supervisors
                        ?.map((s) => `${s.firstName} ${s.lastName}`)
                        .join(", ")
                    : null,
                  "Ei esihenkilöitä",
                )}
              </dd>
            </div>
            <div className="person-detail">
              <dt className="entry-label">Lisätiedot</dt>
              <dd className="entry-value">
                {renderValue(contract.person.freeText, "Ei lisätietoja")}
              </dd>
            </div>
          </motion.dl>
        )}
      </AnimatePresence>
    </article>
  );
}

export default RoomPersonCard;
