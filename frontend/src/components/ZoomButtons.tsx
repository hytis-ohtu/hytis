import { Minus, Plus } from "lucide-react";
import "./ZoomButtons.css";

interface ZoomButtonsProps {
  handleZoom: (e: React.MouseEvent, dir: number) => void;
  handleReset: (e: React.MouseEvent) => void;
}

function ZoomButtons({ handleZoom, handleReset }: ZoomButtonsProps) {
  return (
    <div className="zoom-buttons">
      <button
        data-testid="zoom-increase-button"
        onClick={(e) => handleZoom(e, -1)}
      >
        <Plus />
      </button>
      <button data-testid="reset-transform-button" onClick={handleReset}>
        RESET
      </button>
      <button
        data-testid="zoom-decrease-button"
        onClick={(e) => handleZoom(e, 1)}
      >
        <Minus />
      </button>
    </div>
  );
}

export default ZoomButtons;
