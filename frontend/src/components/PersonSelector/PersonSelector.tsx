import type { Person } from "@types";
import "./PersonSelector.css";

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
    <div className="person-selector" ref={personRef}>
      <input
        id={inputId}
        type="text"
        className="person-selector-input"
        placeholder="Hae..."
        value={personSearch}
        onFocus={onFocus}
        onChange={(e) => setPersonSearch(e.target.value)}
        disabled={disabled}
      />

      {(personOpen || personSearch) && (
        <ul className="person-selector-list" role="listbox">
          {filteredPeople.length === 0 ? (
            <li className="person-selector-list-empty">Ei tuloksia</li>
          ) : (
            filteredPeople.map((person) => (
              <li
                key={person.id}
                className={`person-selector-option${selectedPersonIds.includes(String(person.id)) ? " selected" : ""}`}
                role="option"
                aria-selected={selectedPersonIds.includes(String(person.id))}
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
