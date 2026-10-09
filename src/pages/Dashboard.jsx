import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../api/auth";
import { listDecks } from "../api/decks";
import Loader from "../components/Loader";
import ErrorState from "../components/ErrorState";
import EmptyState from "../components/EmptyState";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [statsData, decksData] = await Promise.all([
        getStats(),
        listDecks({}), 
      ]);
      setStats(statsData);
      setDecks(decksData.results || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="container"><Loader /></div>;
  if (error) return <div className="container"><ErrorState onRetry={fetchData} /></div>;

  if (!stats || stats.decks === 0) {
    return (
      <div className="container">
        <EmptyState 
          message="Welcome to LexiDeck! You don't have any decks yet." 
          actionText="Create your first deck"
          onAction={() => window.location.href = "/decks/new"}
        />
      </div>
    );
  }

  // Decks that have cards due
  const dueDecks = decks.filter(d => d.due_count > 0);

  const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];
  const chartData = [
    { name: 'Box 1 (New/Missed)', value: stats.boxes["1"] },
    { name: 'Box 2', value: stats.boxes["2"] },
    { name: 'Box 3', value: stats.boxes["3"] },
    { name: 'Box 4', value: stats.boxes["4"] },
    { name: 'Box 5 (Mastered)', value: stats.boxes["5"] },
  ].filter(item => item.value > 0);

  return (
    <div className="container">
      <div className="page-header" style={{ alignItems: "flex-start", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <div>
            <h2 style={{ marginBottom: "0.25rem" }}>Dashboard</h2>
            {stats.user && (
              <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                Logged in as <strong>{stats.user.username}</strong> ({stats.user.email})
              </div>
            )}
          </div>
          <Link to="/decks/new" className="btn btn-primary">+ New Deck</Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 grid-cols-4" style={{ marginBottom: "2rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-color)" }}>{stats.due_now}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Due now</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.cards}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Total cards</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--box-5)" }}>{stats.mastered}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Mastered</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: "bold" }}>{stats.accuracy}%</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Accuracy</div>
        </div>
      </div>

      {/* Box Distribution */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Where your cards sit</h3>
        {chartData.length > 0 ? (
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[parseInt(entry.name.match(/\d/)[0], 10) - 1]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--bg-tertiary)", borderColor: "var(--border-color)", borderRadius: "8px", color: "var(--text-primary)" }} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>No cards have been added to any boxes yet.</div>
        )}
      </div>

      {/* Heatmap (Study Activity) */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Activity Heatmap (Last 30 Days)</h3>
        {stats.heatmap && (
          <div className="flex gap-1 flex-wrap">
            {Array.from({ length: 30 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (29 - i));
              const dateString = d.toISOString().split('T')[0];
              const count = stats.heatmap[dateString] || 0;
              
              let colorClass = "bg-bgTertiary";
              if (count > 0 && count <= 10) colorClass = "bg-accent/40";
              else if (count > 10 && count <= 30) colorClass = "bg-accent/70";
              else if (count > 30) colorClass = "bg-accent";

              return (
                <div 
                  key={dateString} 
                  title={`${dateString}: ${count} reviews`}
                  className={`w-5 h-5 rounded-sm ${colorClass} cursor-help transition-opacity hover:opacity-80`}
                ></div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ready to Study */}
      <div className="page-header" style={{ borderBottom: "none", marginBottom: "1rem" }}>
        <h3>Ready to study</h3>
        <Link to="/decks">See all decks &gt;</Link>
      </div>
      
      {dueDecks.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          You're all caught up! No cards due right now.
        </div>
      ) : (
        <div className="grid grid-cols-1">
          {dueDecks.map(deck => (
            <div key={deck.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: "0 0 0.25rem 0" }}>{deck.title}</h4>
                <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  {deck.subject} &bull; {deck.card_count} cards &bull; <span style={{ color: "var(--box-1)", fontWeight: "bold" }}>{deck.due_count} due</span>
                </div>
              </div>
              <Link to={`/decks/${deck.id}/study`} className="btn btn-primary">Study</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
