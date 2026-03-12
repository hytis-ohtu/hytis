import { useState, type ChangeEvent, type FormEvent } from "react";
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
  { id: "misc", label: "Muut tiedot", type: "text" },
];

interface PersonFormProps {
  initial?: Partial<Record<string, string>>;
  onSubmit: (values: Record<string, string>) => void;
  disabled?: boolean;
}

function PersonForm({
  initial = {},
  onSubmit,
  disabled = false,
}: PersonFormProps) {
  const [values, setValues] = useState<Record<string, string>>({
    ...initial,
  } as Record<string, string>);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (disabled) {
      onSubmit(values);
    }
  };

  return (
    <div className="personform-container">
      <form className="personform-form" onSubmit={handleSubmit}>
        {FIELDS.map(({ id, label, type = "text" }) => (
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
