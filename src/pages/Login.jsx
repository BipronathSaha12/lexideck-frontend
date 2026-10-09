import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(form);
      navigate("/");
    } catch (err) {
      if (err.response) {
        // The request was made and the server responded with a status code
        setError(err.response.data.detail || `Server error: ${err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received (CORS or Network Error)
        setError("Network error: Could not connect to the server.");
      } else {
        // Something happened in setting up the request
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "500px", marginTop: "4rem" }}>
      <div className="card">
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.5rem", fontWeight: "bold" }}>Login to LexiDeck</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          {error && <span className="form-error" style={{ marginBottom: "1rem" }}>{error}</span>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
