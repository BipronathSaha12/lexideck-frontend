import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getStudySession } from "../api/decks";
import { reviewCard } from "../api/cards";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";

export default function Study() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [score, setScore] = useState({ done: 0, correct: 0 });

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getStudySession(id);
      setSession(data);
      setIndex(0);
      setFlipped(false);
      setScore({ done: 0, correct: 0 });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const cards = session?.cards || [];
  const card = cards[index];

  const answer = useCallback(async (correct) => {
    if (saving || !card || !flipped) return;
    setSaving(true);
    try {
      await reviewCard(card.id, correct);
      setScore(s => ({ done: s.done + 1, correct: s.correct + (correct ? 1 : 0) }));
      setFlipped(false);
      setIndex(i => i + 1);
    } catch {
      alert("Could not save that answer. Try again.");
    } finally {
      setSaving(false);
    }
  }, [saving, card, flipped]);

  // Keyboard support (O-10)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        navigate(`/decks/${id}`);
        return;
      }
      if (!card) return; // session finished
      
      if (!flipped && e.key === " ") {
        e.preventDefault();
        setFlipped(true);
      } else if (flipped) {
        if (e.key === "1") {
          e.preventDefault();
          answer(false);
        } else if (e.key === "2") {
          e.preventDefault();
          answer(true);
        }
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [card, flipped, answer, navigate, id]);

  if (loading) return <div className="container"><Loader /></div>;
  if (error) return <div className="container"><ErrorState onRetry={fetchSession} /></div>;
  
  if (cards.length === 0) {
    return (
      <div className="container">
        <div className="page-header">
          <h2>
            <Link to={`/decks/${id}`} style={{ color: "var(--text-secondary)" }}>&lt; {session.deck.title} / </Link>
            Study
          </h2>
        </div>
        <EmptyState 
          message="Nothing due in this deck right now." 
          actionText="Back to deck"
          onAction={() => navigate(`/decks/${id}`)}
        />
      </div>
    );
  }

  if (!card) {
    // Session finished
    const percentage = score.done > 0 ? Math.round((score.correct / score.done) * 100) : 0;
    return (
      <div className="container" style={{ textAlign: "center", paddingTop: "4rem" }}>
        <h2>Session done</h2>
        <div style={{ fontSize: "1.25rem", color: "var(--text-secondary)", margin: "1.5rem 0 2.5rem 0" }}>
          {score.done} reviewed, {score.correct} correct, {percentage}% accuracy
        </div>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={() => navigate(`/decks/${id}`)} className="btn btn-secondary">Back to deck</button>
          <button onClick={fetchSession} className="btn btn-primary">Study again</button>
        </div>
      </div>
    );
  }

  const progress = ((index) / cards.length) * 100;

  return (
    <div className="container" style={{ maxWidth: "800px" }}>
      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: 0 }}>{session.deck.title}</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span style={{ fontWeight: "bold", fontFamily: "var(--font-mono)" }}>{index + 1} / {cards.length}</span>
          <button onClick={() => navigate(`/decks/${id}`)} className="btn btn-secondary">Exit</button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div style={{ width: "100%", height: "4px", backgroundColor: "var(--bg-tertiary)", borderRadius: "2px", marginBottom: "2rem", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, backgroundColor: "var(--accent-color)", transition: "width 0.3s" }}></div>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className={`flip-card ${flipped ? "flipped" : ""}`}>
          <div className="flip-card-inner">
            
            {/* Front */}
            <div className="flip-card-front">
              <div style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "2rem" }}>
                {card.front}
              </div>
              {card.hint && (
                <div style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontStyle: "italic" }}>
                  Hint: {card.hint}
                </div>
              )}
              <div style={{ position: "absolute", bottom: "1rem", left: "1rem" }}>
                <span className={`badge badge-box-${card.box}`}>Box {card.box}</span>
              </div>
              <div className="absolute bottom-6 left-0 w-full px-8">
                <button onClick={() => setFlipped(true)} className="btn btn-primary w-full">Show answer (Space)</button>
              </div>
            </div>

            {/* Back */}
            <div className="flip-card-back">
              <div style={{ fontSize: "1.25rem", color: "var(--text-secondary)", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", width: "100%" }}>
                {card.front}
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: "500", marginBottom: "2rem" }}>
                {card.back}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 absolute bottom-6 left-0 w-full px-8">
                <button onClick={() => answer(false)} className="btn btn-danger flex-1" disabled={saving}>Missed (1)</button>
                <button onClick={() => answer(true)} className="btn btn-primary flex-1" style={{ backgroundColor: "var(--success-color)" }} disabled={saving}>Got it (2)</button>
              </div>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}
