import PersonSelector from "@components/PersonSelector/PersonSelector";
import { findAllPeople } from "@services/peopleService";
import {
  findAllDepartments,
  findAllResearchGroups,
  findAllTitles,
  type ReferenceItem,
} from "@services/referenceDataService";
import type { Person } from "@types";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import "./PersonForm.css";

interface Field {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "supervisor";
  required: boolean;
}

const PERSON_FIELDS: Field[] = [
  { id: "firstName", label: "Etunimi", type: "text", required: true },
  { id: "lastName", label: "Sukunimi", type: "text", required: true },
  { id: "department", label: "Osasto", type: "select", required: false },
  { id: "jobtitle", label: "Työnimike", type: "select", required: false },
  {
    id: "supervisors",
    label: "Esihenkilö(t)",
    type: "supervisor",
    required: false,
  },
  {
    id: "researchgroup",
    label: "Tutkimusryhmä",
    type: "select",
    required: false,
  },
  { id: "misc", label: "Muut tiedot", type: "text", required: false },
];

const CONTRACT_FIELDS: Field[] = [
  { id: "startDate", label: "Sopimuksen alku", type: "date", required: false },
  { id: "endDate", label: "Sopimuksen loppu", type: "date", required: false },
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
  PERSON_FIELDS.filter((f) => f.required).every((f) =>
    Boolean(vals[f.id]?.trim()),
  );

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

  const isEdit = Object.keys(initial).length > 0;

  useEffect(() => {
    Promise.all([
      findAllDepartments(),
      findAllTitles(),
      findAllResearchGroups(),
      findAllPeople(),
    ])
      .then(([departments, titles, researchGroups, allPeople]) => {
        setOptions({
          department: departments,
          jobtitle: titles,
          researchgroup: researchGroups,
        });
        setPeople(allPeople);
      })
      .catch((error) => {
        console.error("Failed to fetch reference data:", error);
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

  const isExistingPersonSelected = !!values.personId;

  return (
    <form className="person-form">
      <div className="person-form-separator">
        <span className="separator-line"></span>
        <p>Hae olemassa oleva henkilö</p>
        <span className="separator-line"></span>
      </div>
      <div className="person-form-entry">
        <label htmlFor="person-search">Nimi</label>
        <PersonSelector
          inputId="person-search"
          personRef={existingPersonRef}
          people={people}
          personSearch={existingPersonSearch}
          setPersonSearch={setExistingPersonSearch}
          personOpen={personOpen}
          onFocus={() => setPersonOpen(true)}
          onSelect={(person: Person) => {
            applyExistingPerson(person);
            setExistingPersonSearch("");
            setPersonOpen(false);
          }}
          selectedPersonIds={values.personId ? [values.personId] : []}
        />
      </div>

      <div className="person-form-separator">
        <span className="separator-line"></span>
        <p>{isEdit ? "Muokkaa henkilön tietoja" : "Luo uusi henkilö"}</p>
        <span className="separator-line"></span>
      </div>

      {PERSON_FIELDS.map(({ id, label, type, required }) => {
        const isDisabled = isExistingPersonSelected;
        return (
          <div
            key={id}
            className={`person-form-entry${isDisabled ? " disabled" : ""}`}
          >
            <label className="person-form-label" htmlFor={id}>
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
                className="person-form-input"
              >
                <option value=""> Valitse </option>
                {options[id as keyof SelectOptions].map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : type === "supervisor" ? (
              <>
                <PersonSelector
                  inputId={id}
                  personRef={supervisorRef}
                  people={people}
                  personSearch={supervisorSearch}
                  setPersonSearch={setSupervisorSearch}
                  personOpen={supervisorOpen}
                  onFocus={() => setSupervisorOpen(true)}
                  onSelect={(person: Person) => {
                    toggleSupervisor(String(person.id));
                    setSupervisorSearch("");
                    setSupervisorOpen(false);
                  }}
                  selectedPersonIds={selectedSupervisorIds}
                  disabled={isDisabled}
                />
                {selectedSupervisorIds.length > 0 && (
                  <div className="person-form-supervisors-list">
                    {selectedSupervisorIds.map((sid) => {
                      const p = people.find((p) => String(p.id) === sid);
                      return p ? (
                        <span key={sid} className="person-form-supervisor">
                          {p.firstName} {p.lastName}
                          <button
                            type="button"
                            className="button icon"
                            onClick={() => toggleSupervisor(sid)}
                            disabled={isDisabled}
                            aria-label={`Poista ${p.firstName} ${p.lastName}`}
                          >
                            <X size={16} />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </>
            ) : (
              <input
                id={id}
                name={id}
                type={type}
                value={values[id] ?? ""}
                onChange={handleChange}
                required={required}
                disabled={isDisabled}
                className="person-form-input"
              />
            )}
          </div>
        );
      })}

      <div className="person-form-separator">
        <span className="separator-line"></span>
        <p>Sopimuksen tiedot</p>
        <span className="separator-line"></span>
      </div>

      {CONTRACT_FIELDS.map(({ id, label, type, required }) => {
        return (
          <div key={id} className="person-form-entry">
            <label className="person-form-label" htmlFor={id}>
              {label}
            </label>
            <input
              id={id}
              name={id}
              type={type}
              value={values[id] ?? ""}
              onChange={handleChange}
              required={required}
              className="person-form-input"
            />
          </div>
        );
      })}
    </form>
  );
}

export default PersonForm;
