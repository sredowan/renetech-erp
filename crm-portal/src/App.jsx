import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('bm_token', 'temp_token');
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">🎯</div>
        <h1>Brand Manager</h1>
        <p className="login-sub">Marketing & Brand Operations</p>
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => { localStorage.removeItem('bm_token'); navigate('/login'); };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>🎯 Brand Manager Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <div className="dash-grid">
        <div className="dash-card cyan"><div className="card-label">Active Campaigns</div><div className="card-value">6</div></div>
        <div className="dash-card mint"><div className="card-label">Leads This Week</div><div className="card-value">42</div></div>
        <div className="dash-card amber"><div className="card-label">Conversion Rate</div><div className="card-value">18%</div></div>
        <div className="dash-card violet"><div className="card-label">Social Reach</div><div className="card-value">12.4K</div></div>
      </div>
      <div className="placeholder-section">
        <h2>🚧 Under Development</h2>
        <p>Campaign management, social media analytics, brand guidelines, content calendar, and templates are coming soon.</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('bm_token') ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router basename="/brandmanager">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
