import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register as apiRegister } from "../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await apiRegister(form);
      // On success, either login or send to login with success message
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
      } else {
        setErrors({ detail: "Something went wrong." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "500px", marginTop: "4rem" }}>
      <div className="card">
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Register for LexiDeck</h2>
        {errors.detail && <span className="form-error" style={{ marginBottom: "1rem" }}>{errors.detail}</span>}
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
            {errors.username && <span className="form-error">{errors.username[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            {errors.email && <span className="form-error">{errors.email[0]}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
            {errors.password && <span className="form-error">{errors.password[0]}</span>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
