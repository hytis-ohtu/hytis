import {
  AvailabilityColors,
  DepartmentColors,
} from "../../../hooks/useRoomProperties";
import "./Legend.css";

type Mode = "availability" | "department";

type Entry = { name: string; color: string };

const ModeEntries: Record<Mode, Entry[]> = {
  availability: [
    { name: "Tyhjä", color: AvailabilityColors.available },
    { name: "Tilaa", color: AvailabilityColors.limited },
    { name: "Täynnä", color: AvailabilityColors.full },
  ],
  department: Array.from(DepartmentColors.entries()).map(([name, color]) => ({
    name,
    color,
  })),
};

interface LegendProps {
  mode: Mode;
}

export default function Legend({ mode }: LegendProps) {
  const entries = ModeEntries[mode];

  return (
    <dl className="legend" data-testid="legend">
      {entries.map((entry) => (
        <div key={entry.name} className="legend-item">
          <dt style={{ background: entry.color }} />
          <dd>{entry.name}</dd>
        </div>
      ))}
    </dl>
  );
}
