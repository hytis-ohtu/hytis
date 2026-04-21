import { Minus, Plus } from "lucide-react";
import "./ZoomButtons.css";

interface ZoomButtonsProps {
  handleZoom: (e: React.MouseEvent, dir: number) => void;
}

function ZoomButtons({ handleZoom }: ZoomButtonsProps) {
  return (
    <div className="zoom-buttons">
      <button
        className="button-icon"
        aria-label="Suurenna"
        onClick={(e) => handleZoom(e, -1)}
      >
        <Plus size={20} />
      </button>
      <button
        className="button-icon"
        aria-label="Loitonna"
        onClick={(e) => handleZoom(e, 1)}
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

export default ZoomButtons;
