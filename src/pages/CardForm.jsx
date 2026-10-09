import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCard, createCard, updateCard } from "../api/cards";
import Loader from "../components/Loader";

export default function CardForm() {
  // id is either card id (for edit) or deck id (for new) depending on route
  const { id } = useParams();
  const navigate = useNavigate();
  // We can determine edit mode if the path includes /edit
  const isEdit = window.location.pathname.includes("/edit");
  const deckId = isEdit ? null : id;
  const cardId = isEdit ? id : null;

  const [form, setForm] = useState({ front: "", back: "", hint: "" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit && cardId) {
      getCard(cardId)
        .then(res => {
          setForm({ front: res.front, back: res.back, hint: res.hint || "" });
        })
        .catch(() => navigate(-1)) // Redirect if failed
        .finally(() => setLoading(false));
    }
  }, [isEdit, cardId, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (isEdit) {
        await updateCard(cardId, form);
        navigate(-1); // go back to where they came from
      } else {
        await createCard({ ...form, deck: deckId });
        // Stay on form but clear it, show a success toast or just clear
        setForm({ front: "", back: "", hint: "" });
        // It's a nice touch to stay on the form with fields cleared
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({ detail: "Something went wrong. Please try again." });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container"><Loader /></div>;

  return (
    <div className="container" style={{ maxWidth: "600px" }}>
      <div className="card">
        <h2 style={{ marginBottom: "1.5rem" }}>{isEdit ? "Edit Card" : "New Card"}</h2>
        {!isEdit && <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>Add a card, then keep adding or go back.</p>}
        {errors.detail && <div className="form-error" style={{ marginBottom: "1rem" }}>{errors.detail}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Front (Question)</label>
            <textarea 
              className="form-control" 
              value={form.front} 
              onChange={e => setForm({ ...form, front: e.target.value })} 
              required 
            />
            {errors.front && <span className="form-error">{errors.front[0]}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Back (Answer)</label>
            <textarea 
              className="form-control" 
              value={form.back} 
              onChange={e => setForm({ ...form, back: e.target.value })} 
              required 
            />
            {errors.back && <span className="form-error">{errors.back[0]}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Hint (Optional)</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.hint} 
              onChange={e => setForm({ ...form, hint: e.target.value })} 
            />
            {errors.hint && <span className="form-error">{errors.hint[0]}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={saving}>
              {saving ? "Saving..." : (isEdit ? "Save Card" : "Save and add another")}
            </button>
            <button type="button" className="btn btn-secondary w-full sm:w-auto" onClick={() => navigate(isEdit ? -1 : `/decks/${deckId}`)} disabled={saving}>
              {isEdit ? "Cancel" : "Done"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
