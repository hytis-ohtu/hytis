import { useEffect, useState, type ChangeEvent } from "react";
import {
  findAllDepartments,
  findAllResearchGroups,
  findAllTitles,
  type ReferenceItem,
} from "../services/referenceDataService";
import "./PersonForm.css";

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "select";
  required: boolean;
}

const FIELDS: FieldDef[] = [
  { id: "firstName", label: "Etunimi:", type: "text", required: true },
  { id: "lastName", label: "Sukunimi:", type: "text", required: true },
  { id: "department", label: "Osasto:", type: "select", required: false },
  { id: "jobtitle", label: "Työnimike:", type: "select", required: false },
  { id: "supervisors", label: "Esihenkilö(t):", type: "text", required: false },
  { id: "startDate", label: "Sopimuksen alku:", type: "text", required: false },
  { id: "endDate", label: "Sopimuksen loppu:", type: "text", required: false },
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
  useEffect(() => {
    Promise.all([
      findAllDepartments(),
      findAllTitles(),
      findAllResearchGroups(),
    ])
      .then(([departments, titles, researchGroups]) => {
        setOptions({
          department: departments,
          jobtitle: titles,
          researchgroup: researchGroups,
        });
      })
      .catch((err) => console.error("Failed to load options:", err));
  }, []);

  useEffect(() => {
    onChange(values, isFormValid(values));
  }, [values, onChange]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="personform-container">
      <div className="personform-form">
        {FIELDS.map(({ id, label, type, required }) => (
          <div key={id} className="personform-field">
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
                className="personform-input"
              >
                <option value=""> Valitse </option>
                {options[id as keyof SelectOptions].map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                name={id}
                type={type}
                value={values[id] ?? ""}
                onChange={handleChange}
                required={required}
                className="personform-input"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PersonForm;
