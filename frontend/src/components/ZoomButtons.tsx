import { ZoomIn, ZoomOut } from "lucide-react";
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
        <ZoomIn size={22} />
      </button>
      <button
        data-testid="reset-transform-button"
        onClick={handleReset}
        className="zoom-reset-button"
      >
        Nollaa
      </button>
      <button
        data-testid="zoom-decrease-button"
        onClick={(e) => handleZoom(e, 1)}
      >
        <ZoomOut size={22} />
      </button>
    </div>
  );
}

export default ZoomButtons;
