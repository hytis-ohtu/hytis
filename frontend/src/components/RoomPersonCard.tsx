import { ChevronDown, Pencil, Trash2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRoomSelection } from "../hooks/useRoomSelection";
import type { Contract } from "../types";
import { renderValue } from "../utils/renderValue";

let seenExpandReqId: number | null = null;

interface RoomPersonCardProps {
  contract: Contract;
  onEdit: () => void;
  onRemove: () => void;
}

function parseContractDate(dateString: string): Date | null {
  const parsedDate = new Date(dateString);
  return +parsedDate ? parsedDate : null;
}

function formatContractDate(date: Date | null): string {
  if (date === null) {
    return "--.--.----";
  }

  return new Intl.DateTimeFormat("fi-FI", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getContractDaysUntil(
  startDate: Date | null,
  endDate: Date | null,
): [number | null, number | null] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate?.setHours(0, 0, 0, 0);
  endDate?.setHours(0, 0, 0, 0);

  const daysUntilStart = startDate
    ? Math.floor((+startDate - +today) / (1000 * 60 * 60 * 24))
    : null;
  const daysUntilEnd = endDate
    ? Math.floor((+endDate - +today) / (1000 * 60 * 60 * 24))
    : null;

  return [daysUntilStart, daysUntilEnd];
}

function getContractStatus(
  startDate: Date | null,
  endDate: Date | null,
): string {
  const [daysUntilStart, daysUntilEnd] = getContractDaysUntil(
    startDate,
    endDate,
  );

  if (daysUntilStart !== null && daysUntilStart > 0) {
    return `Alkaa ${daysUntilStart} pv kuluttua`;
  }

  if (daysUntilEnd !== null) {
    const isActiveOrStartsToday =
      daysUntilStart === null || daysUntilStart <= 0;

    if (isActiveOrStartsToday && daysUntilEnd === 0) {
      return "Päättyy tänään";
    }
    if (isActiveOrStartsToday && daysUntilEnd > 0) {
      return `Päättyy ${daysUntilEnd} pv kuluttua`;
    }
    if (daysUntilEnd < 0) {
      return `Päättyi ${Math.abs(daysUntilEnd)} pv sitten`;
    }
  }

  if (daysUntilStart !== null) {
    if (daysUntilStart === 0) {
      return "Alkaa tänään";
    }
    if (daysUntilStart < 0) {
      return `Alkanut ${Math.abs(daysUntilStart)} pv sitten`;
    }
  }

  return "Voimassa toistaiseksi";
}

function getTimelineProgress(
  startDate: Date | null,
  endDate: Date | null,
): number {
  if (startDate === null || endDate === null) {
    return 0;
  }

  const totalDuration = +endDate - +startDate;

  if (totalDuration <= 0) {
    return 0;
  }

  const now = new Date();
  const elapsedDuration = +now - +startDate;

  return Math.min(1, Math.max(0, elapsedDuration / totalDuration));
}

function RoomPersonCard({ contract, onEdit, onRemove }: RoomPersonCardProps) {
  const { expandReq } = useRoomSelection();
  const [detailsCollapsed, setDetailsCollapsed] = useState(true);
  const parsedStartDate = parseContractDate(contract.startDate);
  const parsedEndDate = parseContractDate(contract.endDate);

  const timelineProgress = getTimelineProgress(parsedStartDate, parsedEndDate);
  const contractStatus = getContractStatus(parsedStartDate, parsedEndDate);

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
          <p>
            {contract.person.lastName} {contract.person.firstName}
          </p>
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
          <span className="contract-timeline-date">
            {formatContractDate(parsedStartDate)}
          </span>
          <div className="contract-timeline-track" aria-hidden="true">
            <div className="contract-timeline-fill" />
            <span className="contract-timeline-status">{contractStatus}</span>
          </div>
          <span className="contract-timeline-date">
            {formatContractDate(parsedEndDate)}
          </span>
        </div>
      </header>
      <AnimatePresence initial={false}>
        {!detailsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            className="contract-details"
          >
            <div className="contract-detail">
              <span className="entry-label">Osasto</span>
              <p className="entry-value">
                {renderValue(contract.person.department?.name)}
              </p>
            </div>
            <div className="contract-detail">
              <span className="entry-label">Titteli</span>
              <p className="entry-value">
                {renderValue(contract.person.title?.name)}
              </p>
            </div>
            <div className="contract-detail">
              <span className="entry-label">Tutkimusryhmä</span>
              <p className="entry-value">
                {renderValue(contract.person.researchGroup?.name)}
              </p>
            </div>
            <div className="contract-detail">
              <span className="entry-label">Esihenkilöt</span>
              <p className="entry-value">
                {renderValue(
                  contract.person.supervisors?.length
                    ? contract.person.supervisors
                        ?.map((s) => `${s.firstName} ${s.lastName}`)
                        .join(", ")
                    : null,
                  "Ei esihenkilöitä",
                )}
              </p>
            </div>

            <div className="contract-detail">
              <span className="entry-label">Lisätiedot</span>
              <p className="entry-value">
                {renderValue(contract.person.freeText, "Ei lisätietoja")}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default RoomPersonCard;
