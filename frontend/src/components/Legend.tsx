import {
  AvailabilityColors,
  DepartmentColors,
} from "../hooks/useRoomProperties";
import "./Legend.css";

type LegendMode = "availability" | "department";

interface LegendProps {
  mode: LegendMode;
}

export default function Legend({ mode }: LegendProps) {
  const availabilityEntries = [
    { name: "Tyhjä", color: AvailabilityColors.available },
    { name: "Tilaa", color: AvailabilityColors.limited },
    { name: "Täynnä", color: AvailabilityColors.full },
  ];

  const departmentEntries = Array.from(DepartmentColors.entries()).map(
    ([name, color]) => ({ name, color }),
  );

  const entries =
    mode === "availability" ? availabilityEntries : departmentEntries;

  return (
    <div className="legend" data-testid="legend">
      {entries.map((entry) => (
        <div key={entry.name} className="legend-item">
          <span
            className="legend-color-box"
            style={{ backgroundColor: entry.color }}
          />
          <span className="legend-label">{entry.name}</span>
        </div>
      ))}
    </div>
  );
}
