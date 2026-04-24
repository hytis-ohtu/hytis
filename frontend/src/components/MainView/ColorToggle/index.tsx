import "./style.css";

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
      className="button color-toggle"
      onClick={() => setUseAvailability(!useAvailability)}
    >
      {useAvailability ? "Vastuualueet" : "Varaustila"}
    </button>
  );
}

export default ColorToggle;
