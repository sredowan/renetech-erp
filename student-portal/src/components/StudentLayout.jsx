import React from 'react';
import StudentSidebar from './StudentSidebar';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '../styles/GlobalStyles.css';

const StudentLayout = ({ children, title }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="student-shell">
      <StudentSidebar />
      <main className="student-main">
        <header className="student-topbar glass-morphism">
          <h2 style={{ fontSize: '1.2rem', fontWeight: '500' }}>{title || 'Student Dashboard'}</h2>
          <div 
            className="glass-morphism" 
            style={{ padding: '0.5rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
        </header>
        <div className="student-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
