import { Minus, Plus } from "lucide-react";
import "./style.css";

interface ZoomButtonsProps {
  onZoom: (zoom: boolean) => void;
}

function ZoomButtons({ onZoom }: ZoomButtonsProps) {
  return (
    <div className="zoom-buttons">
      <button
        className="button-icon"
        aria-label="Suurenna"
        onClick={() => onZoom(true)}
      >
        <Plus size={20} />
      </button>
      <button
        className="button-icon"
        aria-label="Loitonna"
        onClick={() => onZoom(false)}
      >
        <Minus size={20} />
      </button>
    </div>
  );
}

export default ZoomButtons;
