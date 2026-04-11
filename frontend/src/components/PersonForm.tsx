import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { findAllPeople } from "../services/peopleService";
import {
  findAllDepartments,
  findAllResearchGroups,
  findAllTitles,
  type ReferenceItem,
} from "../services/referenceDataService";
import type { Person } from "../types";
import "./PersonForm.css";

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "supervisor";
  required: boolean;
}

const FIELDS: FieldDef[] = [
  { id: "firstName", label: "Etunimi:", type: "text", required: true },
  { id: "lastName", label: "Sukunimi:", type: "text", required: true },
  { id: "department", label: "Osasto:", type: "select", required: false },
  { id: "jobtitle", label: "Työnimike:", type: "select", required: false },
  {
    id: "supervisors",
    label: "Esihenkilö(t):",
    type: "supervisor",
    required: false,
  },
  { id: "startDate", label: "Sopimuksen alku:", type: "date", required: false },
  { id: "endDate", label: "Sopimuksen loppu:", type: "date", required: false },
  {
    id: "researchgroup",
    label: "Tutkimusryhmä:",
    type: "select",
    required: false,
  },
  { id: "misc", label: "Muut tiedot:", type: "text", required: false },
];

interface SelectOptions {
  department: ReferenceItem[];
  jobtitle: ReferenceItem[];
  researchgroup: ReferenceItem[];
}

interface PersonFormProps {
  initial?: Record<string, string>;
  onChange: (values: Record<string, string>, isValid: boolean) => void;
}

const isFormValid = (vals: Record<string, string>): boolean =>
  FIELDS.filter((f) => f.required).every((f) => Boolean(vals[f.id]?.trim()));

function PersonForm({ initial = {}, onChange }: PersonFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...initial });
  const [options, setOptions] = useState<SelectOptions>({
    department: [],
    jobtitle: [],
    researchgroup: [],
  });
  const [people, setPeople] = useState<Person[]>([]);
  const [existingPersonSearch, setExistingPersonSearch] = useState("");
  const [personOpen, setPersonOpen] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const [supervisorOpen, setSupervisorOpen] = useState(false);
  const existingPersonRef = useRef<HTMLDivElement>(null);
  const supervisorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      findAllDepartments(),
      findAllTitles(),
      findAllResearchGroups(),
      findAllPeople(),
    ]).then(([departments, titles, researchGroups, allPeople]) => {
      setOptions({
        department: departments,
        jobtitle: titles,
        researchgroup: researchGroups,
      });
      setPeople(allPeople);
    });
  }, []);

  useEffect(() => {
    onChange(values, isFormValid(values));
  }, [values, onChange]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        existingPersonRef.current &&
        !existingPersonRef.current.contains(e.target as Node)
      ) {
        setExistingPersonSearch("");
        setPersonOpen(false);
      }

      if (
        supervisorRef.current &&
        !supervisorRef.current.contains(e.target as Node)
      ) {
        setSupervisorSearch("");
        setSupervisorOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const selectedSupervisorIds = values.supervisors
    ? values.supervisors.split(",").filter(Boolean)
    : [];

  const toggleSupervisor = (id: string) => {
    const updated = selectedSupervisorIds.includes(id)
      ? selectedSupervisorIds.filter((s) => s !== id)
      : [...selectedSupervisorIds, id];
    setValues((prev) => ({ ...prev, supervisors: updated.join(",") }));
  };

  const applyExistingPerson = (person: Person) => {
    setValues((prev) => ({
      ...prev,
      personId: String(person.id),
      firstName: person.firstName,
      lastName: person.lastName,
      department: person.department ? String(person.department.id) : "",
      jobtitle: person.title ? String(person.title.id) : "",
      supervisors: person.supervisors?.length
        ? person.supervisors
            .map((supervisor) => String(supervisor.id))
            .join(",")
        : "",
      researchgroup: person.researchGroup
        ? String(person.researchGroup.id)
        : "",
      misc: person.freeText ?? "",
    }));
  };

  const filteredPeople = people.filter((p) => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    return fullName.includes(supervisorSearch.toLowerCase());
  });

  const isExistingPersonSelected = !!values.personId;

  return (
    <div className="personform-container">
      <div className="personform-form">
        <div className="personform-field personform-field--top">
          <label className="personform-label" htmlFor="person-search">
            Hae henkilö:
          </label>
          <div className="personform-existing-person" ref={existingPersonRef}>
            <input
              id="person-search"
              type="text"
              className="personform-input"
              placeholder="Hae..."
              value={existingPersonSearch}
              onFocus={() => setPersonOpen(true)}
              onChange={(e) => setExistingPersonSearch(e.target.value)}
            />
            {(personOpen || existingPersonSearch) && (
              <ul className="personform-existing-person-list">
                {filteredPeople.length === 0 ? (
                  <li className="personform-existing-person-empty">
                    Ei tuloksia
                  </li>
                ) : (
                  filteredPeople.map((person) => (
                    <li
                      key={person.id}
                      className="personform-existing-person-option"
                      onClick={() => {
                        applyExistingPerson(person);
                        setExistingPersonSearch("");
                        setPersonOpen(false);
                      }}
                    >
                      {person.firstName} {person.lastName}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        {FIELDS.map(({ id, label, type, required }) => {
          const isDisabled =
            isExistingPersonSelected && id !== "startDate" && id !== "endDate";
          return (
            <div
              key={id}
              className={`personform-field${type === "supervisor" ? " personform-field--top" : ""}${isDisabled ? " personform-field--disabled" : ""}`}
            >
              <label className="personform-label" htmlFor={id}>
                {label}
              </label>
              {type === "select" ? (
                <select
                  id={id}
                  name={id}
                  value={values[id] ?? ""}
                  onChange={handleChange}
                  required={required}
                  disabled={isDisabled}
                  className="personform-input"
                >
                  <option value=""> Valitse </option>
                  {options[id as keyof SelectOptions].map((item) => (
                    <option key={item.id} value={String(item.id)}>
                      {item.name}
                    </option>
                  ))}
                </select>
              ) : type === "supervisor" ? (
                <div
                  className={`personform-supervisor${isDisabled ? " personform-supervisor--disabled" : ""}`}
                  ref={supervisorRef}
                >
                  <input
                    id={id}
                    type="text"
                    className="personform-input"
                    placeholder="Hae..."
                    value={supervisorSearch}
                    onFocus={() => setSupervisorOpen(true)}
                    onChange={(e) => setSupervisorSearch(e.target.value)}
                    disabled={isDisabled}
                  />
                  {selectedSupervisorIds.length > 0 && (
                    <div className="personform-supervisor-selected">
                      {selectedSupervisorIds.map((sid) => {
                        const p = people.find((p) => String(p.id) === sid);
                        return p ? (
                          <span key={sid} className="personform-supervisor-tag">
                            {p.firstName} {p.lastName}
                            <button
                              type="button"
                              onClick={() => toggleSupervisor(sid)}
                              disabled={isDisabled}
                              aria-label={`Poista ${p.firstName} ${p.lastName}`}
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                  {(supervisorOpen || supervisorSearch) && (
                    <ul className="personform-supervisor-list">
                      {filteredPeople.length === 0 ? (
                        <li className="personform-supervisor-empty">
                          Ei tuloksia
                        </li>
                      ) : (
                        filteredPeople.map((p) => (
                          <li
                            key={p.id}
                            className={`personform-supervisor-option${selectedSupervisorIds.includes(String(p.id)) ? " selected" : ""}`}
                            onClick={() => {
                              toggleSupervisor(String(p.id));
                              setSupervisorSearch("");
                              setSupervisorOpen(false);
                            }}
                          >
                            {p.firstName} {p.lastName}
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              ) : (
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={values[id] ?? ""}
                  onChange={handleChange}
                  required={required}
                  disabled={isDisabled}
                  className="personform-input"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PersonForm;
