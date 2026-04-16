import { ChevronDown, Pencil, Trash2, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Contract } from "../types";

interface RoomPersonCardProps {
  contract: Contract;
  onEdit: () => void;
  onRemove: () => void;
}

function RoomPersonCard({ contract, onEdit, onRemove }: RoomPersonCardProps) {
  const [detailsCollapsed, setDetailsCollapsed] = useState(false);

  const toggleDetails = () => setDetailsCollapsed((previous) => !previous);

  return (
    <article className="contract">
      <header>
        <User size={18} />
        <p>
          {contract.person.lastName} {contract.person.firstName}
        </p>
        <button
          className="button-icon"
          onClick={toggleDetails}
          aria-label={
            detailsCollapsed ? "Avaa henkilön tiedot" : "Sulje henkilön tiedot"
          }
          aria-expanded={!detailsCollapsed}
        >
          <ChevronDown
            size={18}
            className={
              detailsCollapsed ? "section-chevron collapsed" : "section-chevron"
            }
          />
        </button>
        <button className="button-icon" onClick={onEdit}>
          <Pencil size={18} />
        </button>
        <button className="button-icon" onClick={onRemove}>
          <Trash2 size={18} />
        </button>
      </header>
      <AnimatePresence initial={false}>
        {!detailsCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}

export default RoomPersonCard;
