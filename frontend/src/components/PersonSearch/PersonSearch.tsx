import { useRoomSelection } from "@hooks/useRoomSelection";
import type { SearchType } from "@services/peopleService";
import { searchPeople } from "@services/peopleService";
import type { Person } from "@types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import "./PersonSearch.css";

const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  name: "Nimi",
  supervisor: "Esihenkilö",
  endDate: "Sopimuksen päättymispäivä",
};

const SEARCH_TYPE_PLACEHOLDERS: Record<SearchType, string> = {
  name: "Hae henkilöä nimellä...",
  supervisor: "Hae henkilöä esihenkilöllä...",
  endDate: "Hae henkilöä päättymispäivällä (vvvv-kk-pp)...",
};

function PersonSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Person[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
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
        setIsTypeMenuOpen(false);
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
        const people = await searchPeople(query, searchType);
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
      void search();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchType]);

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

  const handleTypeSelect = (type: SearchType) => {
    setSearchType(type);
    setIsTypeMenuOpen(false);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handlePersonClick = (person: Person) => {
    const contract = person.contracts?.[0];

    if (contract) {
      void selectRoom(contract.room.id, person.id);
    } else {
      console.log("Person has no room assignment");
    }
  };

  return (
    <div className="person-search" ref={searchRef}>
      <div className="person-search-row">
        <div className="person-search-input-wrapper">
          <Search className="person-search-icon" />
          <input
            type="text"
            className="person-search-input"
            placeholder={SEARCH_TYPE_PLACEHOLDERS[searchType]}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            data-testid="person-search-input"
          />
        </div>

        <div className="person-search-type-wrapper">
          <button
            className="person-search-type-button"
            onClick={() => setIsTypeMenuOpen((prev) => !prev)}
            data-testid="person-search-type-button"
          >
            <SlidersHorizontal size={24} strokeWidth={1.7} />
          </button>

          {isTypeMenuOpen && (
            <div
              className="person-search-type-menu"
              data-testid="person-search-type-menu"
            >
              {(Object.keys(SEARCH_TYPE_LABELS) as SearchType[]).map((type) => (
                <button
                  key={type}
                  className={`person-search-type-option${searchType === type ? " active" : ""}`}
                  onClick={() => handleTypeSelect(type)}
                >
                  {SEARCH_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="person-search-dropdown"
          data-testid="person-search-dropdown"
        >
          <div className="person-search-header">
            <span
              className="person-search-results-count"
              data-testid="person-search-results-count"
            >
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
                Ei tuloksia haulle {`"${query}"`}
              </div>
            ) : null}

            {results.map((person) => (
              <div
                key={person.id}
                className="person-search-result"
                onClick={() => handlePersonClick(person)}
              >
                {person.contracts?.[0] && (
                  <span className="person-search-result-room">
                    {person.contracts[0].room.name}
                  </span>
                )}
                <div className="person-search-result-name">
                  {person.firstName} {person.lastName}
                </div>
                <div className="person-search-result-details">
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
