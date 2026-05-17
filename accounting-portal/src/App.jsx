import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/AccountingSidebar';
import FinanceHub from './pages/FinanceHub';
import Reconciliation from './pages/Reconciliation';
import Ledger from './pages/Ledger';
import Invoices from './pages/Invoices';
import POSFees from './pages/POSFees';
import Journal from './pages/Journal';
import ExpenseManager from './pages/ExpenseManager';
import BudgetTracker from './pages/BudgetTracker';
import CashFlow from './pages/CashFlow';
import ReportsHub from './pages/ReportsHub';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="canvas"><Loader2 className="animate-spin" color="var(--primary)" size={48} /></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router basename="/accounting">
          <div className="app-container">
            <Sidebar />
            <main className="canvas">
              <Routes>
                <Route path="/" element={<FinanceHub />} />
                <Route path="/pos-fees" element={<POSFees />} />
                <Route path="/reconciliation" element={<Reconciliation />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/invoices" element={<Invoices />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/expenses" element={<ExpenseManager />} />
                <Route path="/budget" element={<BudgetTracker />} />
                <Route path="/cashflow" element={<CashFlow />} />
                <Route path="/reports" element={<ReportsHub />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
