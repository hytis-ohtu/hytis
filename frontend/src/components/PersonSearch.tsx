import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRoomSelection } from "../hooks/useRoomSelection";
import type { SearchType } from "../services/peopleService";
import { searchPeople } from "../services/peopleService";
import type { Person } from "../types";
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
  const [results, setResults] = useState<Person[] | null>([]);
  const [searchType, setSearchType] = useState<SearchType>("name");
  const [isTypeMenuOpen, setIsTypeMenuOpen] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { selectRoom } = useRoomSelection();

  const hasQuery = query.trim().length >= 2;
  const isResultsOpen = hasQuery && isResultsVisible && !isTypeMenuOpen;
  const hasError = results === null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsTypeMenuOpen(false);
        setIsResultsVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const search = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsResultsVisible(false);
        return;
      }

      try {
        const people = await searchPeople(query, searchType);
        setResults(people);
        setIsResultsVisible(true);
      } catch (error) {
        console.error("Error searching people:", error);
        setResults(null);
        setIsResultsVisible(true);
      }
    };

    const timeoutId = setTimeout(() => {
      void search();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleFocus = () => {
    setIsTypeMenuOpen(false);
    if (hasQuery) setIsResultsVisible(true);
  };

  const handleTypeSelect = (type: SearchType) => {
    setSearchType(type);
    setIsTypeMenuOpen(false);
    setQuery("");
    setResults([]);
  };

  const handlePersonClick = (person: Person) => {
    // TODO: determine which contract to use
    const contract = person.contracts?.[0];

    if (contract) {
      void selectRoom(contract.room.id, person.id);
      setIsResultsVisible(false);
    } else {
      console.log("Person has no room assignment");
    }
  };

  return (
    <search className="person-search" ref={searchRef}>
      <form
        className="person-search-box"
        role="search"
        onSubmit={(e) => e.preventDefault()}
      >
        <label htmlFor="person-search-input">
          <Search className="person-search-icon" />
          <input
            id="person-search-input"
            type="search"
            placeholder={SEARCH_TYPE_PLACEHOLDERS[searchType]}
            aria-label={SEARCH_TYPE_PLACEHOLDERS[searchType]}
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
          />
        </label>

        <div className="person-search-type">
          <button
            type="button"
            aria-label="Hakutyyppi"
            aria-haspopup="menu"
            aria-expanded={isTypeMenuOpen}
            aria-owns="person-search-type-menu"
            aria-controls="person-search-type-menu"
            onClick={() => setIsTypeMenuOpen((prev) => !prev)}
          >
            <SlidersHorizontal strokeWidth={1.7} />
          </button>
        </div>
      </form>

      {isTypeMenuOpen && (
        <div
          id="person-search-type-menu"
          className="person-search-type-menu"
          aria-label="Hakutyyppi"
          role="menu"
        >
          {(Object.keys(SEARCH_TYPE_LABELS) as SearchType[]).map((type) => (
            <button
              key={type}
              className={searchType === type ? "active" : ""}
              onClick={() => handleTypeSelect(type)}
              role="menuitemradio"
              aria-checked={searchType === type}
            >
              {SEARCH_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      {isResultsOpen && (
        <section
          className="person-search-dropdown"
          data-testid="person-search-dropdown"
          aria-label="Hakutulokset"
          aria-live="polite"
        >
          <header>
            <p data-testid="person-search-results-count">
              {`${results?.length ?? 0} ${
                (results?.length ?? 0) === 1 ? "tulos" : "tulosta"
              }`}
            </p>
            <button
              className="button-icon person-search-close"
              aria-label="Sulje hakutulokset"
              onClick={() => setIsResultsVisible(false)}
            >
              <X size={16} />
            </button>
          </header>

          <ul className="person-search-results">
            {hasError ? (
              <li
                className="person-search-message person-search-error"
                role="status"
              >
                Virhe henkilöiden haussa
              </li>
            ) : (results?.length ?? 0) === 0 ? (
              <li
                className="person-search-message person-search-no-results"
                role="status"
              >
                Ei tuloksia haulle {`"${query}"`}
              </li>
            ) : null}

            {(results ?? []).map((person) => (
              <li key={person.id} className="person-search-result">
                <button onClick={() => handlePersonClick(person)}>
                  <div>
                    <p className="person-search-result-name">
                      {person.firstName} {person.lastName}
                    </p>
                    {person.contracts?.[0] && (
                      <p className="person-search-result-room">
                        {person.contracts[0].room.name}
                      </p>
                    )}
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
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </search>
  );
}

export default PersonSearch;
