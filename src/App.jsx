import { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";
import { Menu, X } from "lucide-react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    signOut();
    navigate("/login");
  };
  
  return (
    <nav className="bg-bgSecondary border-b border-borderColor w-full text-white sticky top-0 z-50">
      <div className="flex justify-between items-center px-4 md:px-8 py-4">
        <div>
          <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>IELTS LexiDeck</Link>
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-white hover:text-accent p-2 bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          {user && <Link to="/decks" style={{ color: "white", textDecoration: "none" }}>Decks</Link>}
          {user ? (
            <>
              <span style={{ marginRight: "1rem" }}>Welcome, {user}</span>
              <button onClick={handleLogout} className="btn btn-danger" style={{ padding: "0.5rem 1rem" }}>Logout</button>
            </>
          ) : (
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
          )}
        </div>
      </div>
      
      {/* Mobile menu drop-down */}
      {isMenuOpen && (
        <div className="md:hidden flex flex-col px-4 pt-2 pb-4 space-y-3 bg-bgTertiary border-t border-borderColor shadow-lg">
          {user && <Link to="/decks" className="text-white block py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Decks</Link>}
          {user ? (
            <>
              <span className="block py-2 text-textSecondary border-t border-borderColor mt-2 pt-4">Welcome, {user}</span>
              <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="btn btn-danger w-full mt-2 justify-center">Logout</button>
            </>
          ) : (
            <Link to="/login" className="text-white block py-2 font-medium" onClick={() => setIsMenuOpen(false)}>Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-bgPrimary text-textPrimary font-sans flex flex-col">
      <Navbar />
      <main className="flex-1">
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
      </main>
    </div>
  );
}

export default App;
