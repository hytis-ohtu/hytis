import { useState, type ReactNode } from "react";
import "./ConfirmationButton.css";

interface Props {
  onConfirm: () => void;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
  message?: string;
  className?: string;
}

export default function ConfirmationButton({
  onConfirm,
  children,
  confirmText = "Kyllä",
  cancelText = "Ei",
  message = "Tee muutokset  ?",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);

  const handleTrigger = () => setOpen(true);
  const handleConfirm = () => {
    setOpen(false);
    onConfirm();
  };
  const handleCancel = () => setOpen(false);

  return (
    <div>
      <button className={className} onClick={handleTrigger}>
        {children}
      </button>

      {open && (
        <div className="confirmation-overlay">
          <div className="confirmation-modal">
            <h2 className="confirmation-title">{message}</h2>
            <div className="confirmation-buttons">
              <button className="confirmation-button" onClick={handleConfirm}>
                {confirmText}
              </button>
              <button className="confirmation-button" onClick={handleCancel}>
                {cancelText}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
