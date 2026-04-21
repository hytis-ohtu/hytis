import "./ColorToggle.css";
import Legend from "./Legend";

interface ColorToggleProps {
  useAvailability: boolean;
  setUseAvailability: (state: boolean) => void;
}

function ColorToggle({
  useAvailability,
  setUseAvailability,
}: ColorToggleProps) {
  return (
    <div>
      <button
        data-testid="switch-color-mode"
        onClick={() => setUseAvailability(!useAvailability)}
        className="color-button"
      >
        {useAvailability ? "Näytä Vastuualueet" : "Näytä Tila"}
      </button>
      <Legend mode={useAvailability ? "availability" : "department"} />
    </div>
  );
}

export default ColorToggle;
