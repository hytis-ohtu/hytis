import "./ColorToggle.css";

interface ColorToggleProps {
  useAvailability: boolean;
  setUseAvailability: (state: boolean) => void;
}

function ColorToggle({
  useAvailability,
  setUseAvailability,
}: ColorToggleProps) {
  return (
    <button
      className="color-toggle"
      onClick={() => setUseAvailability(!useAvailability)}
    >
      {useAvailability ? "Vastuualueet" : "Varaustila"}
    </button>
  );
}

export default ColorToggle;
