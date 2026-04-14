import { Minus, Plus } from "lucide-react";
import "./ZoomButtons.css";

interface ZoomButtonsProps {
  handleZoom: (e: React.MouseEvent, dir: number) => void;
  handleReset: (e: React.MouseEvent) => void;
}

function ZoomButtons({ handleZoom, handleReset }: ZoomButtonsProps) {
  return (
    <div>
      <button
        data-testid="zoom-increase-button"
        onClick={(e) => handleZoom(e, -1)}
        className="zoom-in-button"
      >
        <Plus />
      </button>
      <button
        data-testid="reset-transform-button"
        onClick={handleReset}
        className="reset-button"
      >
        RESET
      </button>
      <button
        data-testid="zoom-decrease-button"
        onClick={(e) => handleZoom(e, 1)}
        className="zoom-out-button"
      >
        <Minus />
      </button>
    </div>
  );
}

export default ZoomButtons;
