import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DeckList from "./pages/DeckList";
import DeckForm from "./pages/DeckForm";
import DeckDetail from "./pages/DeckDetail";
import CardForm from "./pages/CardForm";
import Study from "./pages/Study";

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    signOut();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary font-body">
      <nav className="flex justify-between items-center px-8 py-4 bg-bgSecondary border-b border-borderColor w-full flex-wrap gap-4 text-white">
      <div>
        <Link to="/" style={{ color: "white", textDecoration: "none", marginRight: "1rem", fontWeight: "bold" }}>IELTS LexiDeck</Link>
        {user && <Link to="/decks" style={{ color: "white", textDecoration: "none" }}>Decks</Link>}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: "1rem" }}>Welcome, {user}</span>
            <button onClick={handleLogout} style={{ background: "#e94560", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "4px", cursor: "pointer" }}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
        )}
      </div>
    </nav>
    </div>
  );
}

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/decks" element={
          <ProtectedRoute>
            <DeckList />
          </ProtectedRoute>
        } />
        <Route path="/decks/new" element={
          <ProtectedRoute>
            <DeckForm />
          </ProtectedRoute>
        } />
        <Route path="/decks/:id" element={
          <ProtectedRoute>
            <DeckDetail />
          </ProtectedRoute>
        } />
        <Route path="/decks/:id/edit" element={
          <ProtectedRoute>
            <DeckForm />
          </ProtectedRoute>
        } />
        <Route path="/decks/:id/cards/new" element={
          <ProtectedRoute>
            <CardForm />
          </ProtectedRoute>
        } />
        <Route path="/cards/:id/edit" element={
          <ProtectedRoute>
            <CardForm />
          </ProtectedRoute>
        } />
        <Route path="/decks/:id/study" element={
          <ProtectedRoute>
            <Study />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
