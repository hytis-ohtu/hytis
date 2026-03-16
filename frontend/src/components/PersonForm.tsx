import { useEffect, useState, type ChangeEvent } from "react";
import "./PersonForm.css";

interface FieldDef {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

const FIELDS: FieldDef[] = [
  { id: "name", label: "Nimi:", type: "text", required: true },
  { id: "department", label: "Osasto:", type: "text", required: true },
  { id: "jobtitle", label: "Työnimike:", type: "text", required: true },
  { id: "supervisors", label: "Esihenkilö(t):", type: "text", required: true },
  { id: "contractstart", label: "Sopimusalku:", type: "text", required: true },
  { id: "contractend", label: "Sopimusloppu:", type: "text", required: true },
  {
    id: "researchgroup",
    label: "Tutkimusryhmä:",
    type: "text",
    required: false,
  },
  { id: "misc", label: "Muut tiedot:", type: "text", required: false },
];

interface PersonFormProps {
  initial?: Record<string, string>;
  onChange: (values: Record<string, string>, isValid: boolean) => void;
}

const isFormValid = (vals: Record<string, string>): boolean => {
  return FIELDS.filter((f) => f.required).every((f) =>
    Boolean(vals[f.id]?.trim()),
  );
};

function PersonForm({ initial = {}, onChange }: PersonFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...initial });

  useEffect(() => {
    onChange(values, isFormValid(values));
  }, [values, onChange]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      onChange(next, isFormValid(next));
      return next;
    });
  };

  return (
    <div className="personform-container">
      <form className="personform-form">
        {FIELDS.map(({ id, label, type, required }) => (
          <div key={id} className="personform-field">
            <label className="personform-label" htmlFor={id}>
              {label}
            </label>
            <input
              id={id}
              name={id}
              type={type}
              value={values[id] ?? ""}
              onChange={handleChange}
              required={required}
              className="personform-input"
            />
          </div>
        ))}
      </form>
    </div>
  );
}

export default PersonForm;
