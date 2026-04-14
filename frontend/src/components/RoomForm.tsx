import { useEffect, useState, type ChangeEvent } from "react";
import {
  findAllDepartments,
  type ReferenceItem,
} from "../services/referenceDataService";
import "./RoomForm.css";

interface FieldDef {
  id: string;
  label: string;
  type: "text" | "number" | "select";
  required: boolean;
  min?: number;
  step?: string;
}

const FIELDS: FieldDef[] = [
  {
    id: "capacity",
    label: "Kapasiteetti:",
    type: "number",
    required: true,
    min: 1,
    step: "1",
  },
  { id: "roomType", label: "Huonetyyppi:", type: "text", required: true },
  { id: "department", label: "Osasto:", type: "select", required: true },
  { id: "freeText", label: "Lisätiedot:", type: "text", required: false },
];

interface SelectOptions {
  department: ReferenceItem[];
}

interface RoomFormProps {
  initial: Record<string, string>;
  onChange: (values: Record<string, string>, isValid: boolean) => void;
}

const isFormValid = (vals: Record<string, string>): boolean =>
  FIELDS.filter((f) => f.required).every((f) => Boolean(vals[f.id]?.trim()));

function RoomForm({ initial, onChange }: RoomFormProps) {
  const [values, setValues] = useState<Record<string, string>>({ ...initial });
  const [options, setOptions] = useState<SelectOptions>({ department: [] });

  useEffect(() => {
    findAllDepartments().then((departments) =>
      setOptions({ department: departments }),
    );
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
    <div className="roomform-container">
      <div className="roomform-form">
        {FIELDS.map(({ id, label, type, required, min, step }) => (
          <div key={id} className="roomform-field">
            <label className="roomform-label" htmlFor={id}>
              {label}
            </label>
            {type === "select" ? (
              <select
                id={id}
                name={id}
                value={values[id] ?? ""}
                onChange={handleChange}
                required={required}
                className="roomform-input"
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
                className="roomform-input"
                {...(min !== undefined && { min })}
                {...(step !== undefined && { step })}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RoomForm;
