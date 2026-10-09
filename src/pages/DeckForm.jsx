import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDeck, createDeck, updateDeck } from "../api/decks";
import Loader from "../components/Loader";

export default function DeckForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", subject: "OTHER" });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (id) {
      getDeck(id)
        .then(res => {
          setForm({ title: res.title, description: res.description, subject: res.subject });
        })
        .catch(() => navigate("/decks")) // Redirect if failed
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      if (id) {
        await updateDeck(id, form);
        navigate(`/decks/${id}`);
      } else {
        const newDeck = await createDeck(form);
        navigate(`/decks/${newDeck.id}`);
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
        <h2 style={{ marginBottom: "1.5rem" }}>{id ? "Edit Deck" : "New Deck"}</h2>
        {errors.detail && <div className="form-error" style={{ marginBottom: "1rem" }}>{errors.detail}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={form.title} 
              onChange={e => setForm({ ...form, title: e.target.value })} 
              required 
            />
            {errors.title && <span className="form-error">{errors.title[0]}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select 
              className="form-control" 
              value={form.subject} 
              onChange={e => setForm({ ...form, subject: e.target.value })}
            >
              <option value="PROGRAMMING">Programming</option>
              <option value="LANGUAGE">Language</option>
              <option value="ACADEMIC">Academic</option>
              <option value="INTERVIEW">Interview</option>
              <option value="OTHER">Other</option>
            </select>
            {errors.subject && <span className="form-error">{errors.subject[0]}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea 
              className="form-control" 
              value={form.description} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
            {errors.description && <span className="form-error">{errors.description[0]}</span>}
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Deck"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
