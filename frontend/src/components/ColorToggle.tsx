import { useRoomColors } from "../hooks/useRoomColors";
import "./ColorToggle.css";
import Legend from "./Legend";

function ColorToggle() {
  const { useAvailability, setUseAvailability } = useRoomColors();

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
