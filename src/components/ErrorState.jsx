export default function ErrorState({ message, onRetry }) {
  return (
    <div className="error-state animate-fade-in">
      <h3>{message || "An error occurred."}</h3>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Retry
        </button>
      )}
    </div>
  );
}
