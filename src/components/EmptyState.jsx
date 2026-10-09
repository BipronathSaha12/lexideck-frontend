export default function EmptyState({ message, actionText, onAction }) {
  return (
    <div className="empty-state animate-fade-in">
      <h3>{message || "No data found."}</h3>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ marginTop: "1rem" }}>
          {actionText}
        </button>
      )}
    </div>
  );
}
