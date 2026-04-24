import type { Person } from "../../types";
import "./style.css";

interface PersonSelectorProps {
  inputId: string;
  personRef: React.RefObject<HTMLDivElement | null>;
  people: Person[];
  personSearch: string;
  setPersonSearch: (value: string) => void;
  personOpen: boolean;
  onFocus: () => void;
  onSelect: (person: Person) => void;
  selectedPersonIds?: string[];
  disabled?: boolean;
}

export default function PersonSelector({
  inputId,
  personRef,
  people,
  personSearch,
  setPersonSearch,
  personOpen,
  onFocus,
  onSelect,
  selectedPersonIds = [],
  disabled = false,
}: PersonSelectorProps) {
  const filteredPeople = people.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(personSearch.toLowerCase());
  });

  return (
    <div className="personform-person" ref={personRef}>
      <input
        id={inputId}
        type="text"
        className="personform-input"
        placeholder="Hae..."
        value={personSearch}
        onFocus={onFocus}
        onChange={(e) => setPersonSearch(e.target.value)}
        disabled={disabled}
      />

      {(personOpen || personSearch) && (
        <ul className="personform-person-list">
          {filteredPeople.length === 0 ? (
            <li className="personform-person-empty">Ei tuloksia</li>
          ) : (
            filteredPeople.map((person) => (
              <li
                key={person.id}
                className={`personform-person-option${selectedPersonIds.includes(String(person.id)) ? " selected" : ""}`}
                onClick={() => onSelect(person)}
              >
                {person.firstName} {person.lastName}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
