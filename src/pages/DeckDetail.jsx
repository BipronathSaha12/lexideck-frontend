import { useEffect, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { getDeck } from "../api/decks";
import { listCards, deleteCard } from "../api/cards";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

function BoxBadge({ box }) {
  return <span className={`badge badge-box-${box}`}>Box {box}</span>;
}

export default function DeckDetail() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState({ count: 0, results: [] });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const box = searchParams.get("box") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (searchParams.get("search") || "")) {
        const newParams = new URLSearchParams(searchParams);
        if (searchTerm) newParams.set("search", searchTerm);
        else newParams.delete("search");
        newParams.set("page", "1");
        setSearchParams(newParams);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, setSearchParams]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);
    
    const params = { deck: id, page };
    if (searchParams.get("search")) params.search = searchParams.get("search");
    if (box) params.box = box;

    Promise.all([
      getDeck(id),
      listCards(params)
    ])
      .then(([deckRes, cardsRes]) => {
        if (!ignore) {
          setDeck(deckRes);
          setCards(cardsRes);
        }
      })
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
  }, [id, searchParams.get("search"), box, page, searchParams, setSearchParams]);

  const handleBoxChange = (e) => {
    const newParams = new URLSearchParams(searchParams);
    if (e.target.value) newParams.set("box", e.target.value);
    else newParams.delete("box");
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
      await deleteCard(deleteTarget.id);
      setDeleteTarget(null);
      if (cards.results.length === 1 && page > 1) {
        handlePageChange(page - 1);
      } else {
        setCards(prev => ({ ...prev, count: prev.count - 1, results: prev.results.filter(c => c.id !== deleteTarget.id) }));
      }
    } catch {
      alert("Failed to delete card.");
    }
  };

  const totalPages = Math.ceil(cards.count / 10);

  if (loading && !deck) return <div className="container"><Loader /></div>;
  if (error && !deck) return <div className="container"><ErrorState onRetry={() => setSearchParams(new URLSearchParams(searchParams))} /></div>;

  return (
    <div className="container">
      <div className="page-header" style={{ alignItems: "flex-start", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <h2>
            <Link to="/decks" style={{ color: "var(--text-secondary)" }}>&lt; Decks / </Link>
            {deck.title}
          </h2>
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to={`/decks/${id}/cards/new`} className="btn btn-secondary">+ Add Card</Link>
            <Link to={`/decks/${id}/study`} className="btn btn-primary">Study {deck.due_count}</Link>
          </div>
        </div>
        {deck.description && <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{deck.description}</p>}
      </div>

      <div className="card" style={{ marginBottom: "2rem", display: "flex", gap: "1rem" }}>
        <input 
          type="text" 
          className="form-control" 
          placeholder="Search front or back..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
        />
        <select className="form-control" value={box} onChange={handleBoxChange} style={{ width: "150px" }}>
          <option value="">Box: All</option>
          {[1, 2, 3, 4, 5].map(b => <option key={b} value={b}>Box {b}</option>)}
        </select>
      </div>

      {loading && deck ? <Loader /> : error ? <ErrorState onRetry={() => setSearchParams(new URLSearchParams(searchParams))} /> : (
        <>
          {cards.results.length === 0 ? (
            <EmptyState 
              message={searchTerm || box ? "No cards match this filter." : "No cards in this deck yet."} 
              actionText={!searchTerm && !box ? "Add your first card" : null}
              onAction={!searchTerm && !box ? () => window.location.href = `/decks/${id}/cards/new` : null}
            />
          ) : (
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                    <th style={{ padding: "1rem" }}>Front</th>
                    <th style={{ padding: "1rem" }}>Box</th>
                    <th style={{ padding: "1rem" }}>Due</th>
                    <th style={{ padding: "1rem", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.results.map(card => (
                    <tr 
                      key={card.id} 
                      style={{ borderBottom: "1px solid var(--border-color)", cursor: "pointer", transition: "background-color 0.2s" }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      onClick={(e) => {
                        // Prevent navigation if clicking on a button or link directly
                        if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
                          navigate(`/cards/${card.id}/edit`);
                        }
                      }}
                    >
                      <td style={{ padding: "1rem" }}>
                        <div style={{ fontWeight: "500" }}>{card.front}</div>
                        <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                          {card.back.length > 60 ? card.back.substring(0, 60) + "..." : card.back}
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}><BoxBadge box={card.box} /></td>
                      <td style={{ padding: "1rem", fontSize: "0.875rem", color: card.is_due ? "var(--box-1)" : "var(--text-secondary)" }}>
                        {card.is_due ? "due now" : new Date(card.next_review_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "1rem", textAlign: "right" }}>
                        <Link to={`/cards/${card.id}/edit`} className="btn btn-secondary" style={{ padding: "0.25rem 0.5rem", marginRight: "0.5rem" }}>Edit</Link>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(card); }} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem" }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
              <button className="btn btn-secondary" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>&lt; Prev</button>
              <span style={{ padding: "0.75rem" }}>Page {page} of {totalPages}</span>
              <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>Next &gt;</button>
            </div>
          )}
        </>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        title="Delete this card?"
        message={`Delete card '${deleteTarget?.front}'? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
