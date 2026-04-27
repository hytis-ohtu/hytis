import { useEffect, useId, useRef } from "react";
import "./ConfirmationDialog.css";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title = "Oletko varma?",
  confirmText = "Kyllä",
  cancelText = "Ei",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Toggle dialog
  useEffect(() => {
    const dialogElement = dialogRef.current;
    if (!dialogElement) {
      return;
    }

    if (isOpen && !dialogElement.open) {
      dialogElement.showModal();
    }

    if (!isOpen && dialogElement.open) {
      dialogElement.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      role="alertdialog"
      aria-labelledby={titleId}
      onClose={onCancel}
    >
      <h2 id={titleId} className="confirmation-title">
        {title}
      </h2>
      <div className="confirmation-buttons">
        <button className="button" onClick={onConfirm}>
          {confirmText}
        </button>
        <button className="button" onClick={onCancel}>
          {cancelText}
        </button>
      </div>
    </dialog>
  );
}
