import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { listDecks, deleteDeck } from "../api/decks";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

export default function DeckList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ count: 0, results: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Local state for debouncing
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const subject = searchParams.get("subject") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("search") || "")) {
        const newParams = new URLSearchParams(searchParams);
        if (searchTerm) newParams.set("search", searchTerm);
        else newParams.delete("search");
        newParams.set("page", "1"); // Reset page on search change
        setSearchParams(newParams);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    
    // axios drops undefined/empty string params automatically? Actually no, we should clean them.
    const params = { page };
    if (searchParams.get("search")) params.search = searchParams.get("search");
    if (subject) params.subject = subject;

    listDecks(params)
      .then((res) => { if (!ignore) setData(res); })
      .catch((err) => { 
        if (!ignore) {
          if (err.response?.status === 404 && page > 1) {
            const newParams = new URLSearchParams(searchParams);
            newParams.set("page", "1");
            setSearchParams(newParams);
          } else {
            setError(true);
          }
        }
      })
      .finally(() => { if (!ignore) setLoading(false); });
      
    return () => { ignore = true; };
  }, [searchParams.get("search"), subject, page, searchParams, setSearchParams]);

  const handleSubjectChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set("subject", e.target.value);
    else newParams.delete("subject");
    newParams.set("page", "1");
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", newPage.toString());
    setSearchParams(newParams);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteDeck(deleteTarget.id);
      setDeleteTarget(null);
      // Optimistic delete or refetch. We can just refetch by forcing a state update or filtering.
      // Easiest is to filter locally if it doesn't leave the page empty.
      if (data.results.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        setData(prev => ({ ...prev, count: prev.count - 1, results: prev.results.filter(d => d.id !== deleteTarget.id) }));
      }
    } catch {
      alert("Failed to delete deck.");
    }
  };

  const totalPages = Math.ceil(data.count / 10);

  return (
    <div className="container">
      <div className="page-header">
        <h2>Your Decks</h2>
        <Link to="/decks/new" className="btn btn-primary">+ New Deck</Link>
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search decks..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <select className="form-control" value={subject} onChange={handleSubjectChange} style={{ width: "200px" }}>
          <option value="">All subjects</option>
          <option value="PROGRAMMING">Programming</option>
          <option value="LANGUAGE">Language</option>
          <option value="ACADEMIC">Academic</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {loading ? <Loader /> : error ? <ErrorState onRetry={() => setSearchParams(new URLSearchParams(searchParams))} /> : (
        <>
          {data.results.length === 0 ? (
            <EmptyState message="No decks found matching this criteria." />
          ) : (
            <div className="grid grid-cols-1">
              {data.results.map(deck => (
                <div key={deck.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <h3 style={{ margin: "0 0 0.5rem 0" }}><Link to={`/decks/${deck.id}`}>{deck.title}</Link></h3>
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                      {deck.subject} &bull; {deck.card_count} cards &bull; {deck.due_count} due
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Link to={`/decks/${deck.id}/study`} className="btn btn-primary">Study</Link>
                    <Link to={`/decks/${deck.id}/edit`} className="btn btn-secondary">Edit</Link>
                    <button onClick={() => setDeleteTarget(deck)} className="btn btn-danger">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
              <button 
                className="btn btn-secondary" 
                disabled={page <= 1} 
                onClick={() => handlePageChange(page - 1)}
              >
                &lt; Prev
              </button>
              <span style={{ padding: "0.75rem" }}>Page {page} of {totalPages}</span>
              <button 
                className="btn btn-secondary" 
                disabled={page >= totalPages} 
                onClick={() => handlePageChange(page + 1)}
              >
                Next &gt;
              </button>
            </div>
          )}
        </>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title="Delete this deck?"
        message={`Delete '${deleteTarget?.title}' and all ${deleteTarget?.card_count} cards in it? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
