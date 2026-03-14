import { useEffect, useState, type ChangeEvent } from "react";
import "./PersonForm.css";

interface FieldDef {
  id: string;
  label: string;
  type: string;
}

const FIELDS: FieldDef[] = [
  { id: "name", label: "Nimi", type: "text" },
  { id: "department", label: "Osasto", type: "text" },
  { id: "jobtitle", label: "Työnimike", type: "text" },
  { id: "supervisors", label: "Esihenkilö(t)", type: "text" },
  { id: "researchgroup", label: "Tutkimusryhmä", type: "text" },
  { id: "contract", label: "Sopimuskesto", type: "text" },
  { id: "misc", label: "Muut tiedot", type: "text" },
];

interface PersonFormProps {
  initial?: Partial<Record<string, string>>;
  onChange: (values: Record<string, string>) => void;
}

function PersonForm({ initial = {}, onChange }: PersonFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...initial });

  // Sync if the parent reopens the modal with different initial data
  useEffect(() => {
    setValues({ ...initial });
  }, [initial]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      onChange(next); // keep parent in sync on every keystroke
      return next;
    });
  };

  return (
    <div className="personform-container">
      <form className="personform-form">
        {FIELDS.map(({ id, label, type }) => (
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
              className="personform-input"
            />
          </div>
        ))}
      </form>
    </div>
  );
}

export default PersonForm;
