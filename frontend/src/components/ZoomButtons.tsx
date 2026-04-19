import { Minus, Plus } from "lucide-react";
import "./ZoomButtons.css";

interface ZoomButtonsProps {
  handleZoom: (e: React.MouseEvent, dir: number) => void;
}

function ZoomButtons({ handleZoom }: ZoomButtonsProps) {
  return (
    <div className="zoom-buttons">
      <button
        data-testid="zoom-increase-button"
        onClick={(e) => handleZoom(e, -1)}
      >
        <Plus size={22} />
      </button>

      <button
        data-testid="zoom-decrease-button"
        onClick={(e) => handleZoom(e, 1)}
      >
        <Minus size={22} />
      </button>
    </div>
  );
}

export default ZoomButtons;
