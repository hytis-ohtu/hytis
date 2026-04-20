import "./ConfirmationDialog.css";

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
export default function ConfirmDialog({
  open,
  title = "Oletko varma?",
  confirmText = "Kyllä",
  cancelText = "Ei",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirmation-title">{title}</h2>
        <div className="confirmation-buttons">
          <button className="confirmation-button" onClick={onConfirm}>
            {confirmText}
          </button>
          <button className="confirmation-button" onClick={onCancel}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
