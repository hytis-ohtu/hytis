import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchPeople } from "../services/peopleService";
import { useRoomSelection } from "../hooks/useRoomSelection";
import type { Person } from "../types";
import "./PersonSearch.css";

function PersonSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { selectRoom } = useRoomSelection();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Search function
  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 3) {
        setResults([]);
        setIsOpen(false);
        setError(false);
        return;
      }

      try {
        const people = await searchPeople(query);
        setResults(people);
        setIsOpen(true);
        setError(false);
      } catch (error) {
        console.error("Error searching people:", error);
        setResults([]);
        setError(true);
        setIsOpen(true);
      }
    };

    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    if (query.trim().length >= 3 && results.length > 0) {
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handlePersonClick = (person: Person) => {
    // Get the person's first contract (regardless of end date for demo purposes)
    const contract = person.contracts && person.contracts.length > 0
      ? person.contracts[0]
      : null;

    if (contract?.room) {
      // Select the room and pass person ID to auto-expand their details
      selectRoom(String(contract.room.id), person.id);
    } else {
      // Person has no room - show notification
      console.log("Person has no room assignment");
      // Could add a toast notification here
    }
  };

  return (
    <div className="person-search" ref={searchRef}>
      <div className="person-search-input-wrapper">
        <Search className="person-search-icon" />
        <input
          type="text"
          className="person-search-input"
          placeholder="Hae henkilöä..."
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          data-testid="person-search-input"
        />
      </div>

      {isOpen && (
        <div className="person-search-dropdown" data-testid="person-search-dropdown">
          <div className="person-search-header">
            <span className="person-search-results-count" data-testid="person-search-results-count">
              {results.length} {results.length === 1 ? "tulos" : "tulosta"}
            </span>
            <button
              className="person-search-close"
              onClick={handleClose}
              aria-label="Sulje"
            >
              <X size={16} />
            </button>
          </div>

          <div className="person-search-results">
            {error ? (
              <div className="person-search-error">
                Virhe henkilöiden haussa
              </div>
            ) : results.length === 0 ? (
              <div className="person-search-no-results">
                Ei tuloksia haulle "{query}"
              </div>
            ) : null}

            {results.map((person) => (
              <div
                key={person.id}
                className="person-search-result"
                onClick={() => handlePersonClick(person)}
              >
                <div className="person-search-result-name">
                  {person.firstName} {person.lastName}
                </div>
                <div className="person-search-result-details">
                  {person.contracts && person.contracts.length > 0 && person.contracts[0].room && (
                    <span className="person-search-result-room">
                      {person.contracts[0].room.name}
                    </span>
                  )}
                  {person.title?.name && (
                    <span className="person-search-result-title">
                      {person.title.name}
                    </span>
                  )}
                  {person.department?.name && (
                    <span className="person-search-result-department">
                      {person.department.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PersonSearch;
