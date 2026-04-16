import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { Contract } from "../types";

interface RoomPersonCardProps {
  contract: Contract;
  onEdit: () => void;
  onRemove: () => void;
}

function RoomPersonCard({ contract, onEdit, onRemove }: RoomPersonCardProps) {
  return (
    <article className="contract">
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
          <button className="button-icon edit-person" onClick={onEdit}>
            <Pencil size={18} />
          </button>
          <button className="button-icon remove-contract" onClick={onRemove}>
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
  );
}

export default RoomPersonCard;
