import { type KeyboardEvent, useEffect, useId, useRef } from "react";
import "./ConfirmationDialog.css";

interface ConfirmDialogProps {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title = "Oletko varma?",
  confirmText = "Kyllä",
  cancelText = "Ei",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  const handleEscape = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Escape") return;
    e.preventDefault();
    e.stopPropagation();
    handleCancel();
  };

  const handleCancel = () => {
    dialogRef.current?.close();
    onClose();
  };

  const handleConfirm = () => {
    dialogRef.current?.close();
    onConfirm();
  };

  return (
    <dialog
      ref={dialogRef}
      className="confirmation-dialog"
      role="alertdialog"
      aria-labelledby={titleId}
      onKeyDown={handleEscape}
    >
      <h2 id={titleId} className="confirmation-title">
        {title}
      </h2>
      <div className="confirmation-buttons">
        <button className="button" onClick={handleConfirm}>
          {confirmText}
        </button>
        <button className="button" onClick={handleCancel}>
          {cancelText}
        </button>
      </div>
    </dialog>
  );
}
