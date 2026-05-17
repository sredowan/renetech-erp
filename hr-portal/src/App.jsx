import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    localStorage.setItem('hrm_token', 'temp_token');
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">👥</div>
        <h1>HRM Portal</h1>
        <p className="login-sub">Human Resource Management</p>
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
  const handleLogout = () => { localStorage.removeItem('hrm_token'); navigate('/login'); };

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1>👥 HRM Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </header>
      <div className="dash-grid">
        <div className="dash-card mint"><div className="card-label">Total Staff</div><div className="card-value">24</div></div>
        <div className="dash-card cyan"><div className="card-label">Present Today</div><div className="card-value">21</div></div>
        <div className="dash-card amber"><div className="card-label">On Leave</div><div className="card-value">3</div></div>
        <div className="dash-card violet"><div className="card-label">Open Positions</div><div className="card-value">2</div></div>
      </div>
      <div className="placeholder-section">
        <h2>🚧 Under Development</h2>
        <p>Staff directory, attendance, payroll, leave management, and recruitment modules are coming soon.</p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem('hrm_token') ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router basename="/hrm">
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
