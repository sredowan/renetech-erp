import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const selectedBranch = localStorage.getItem('selectedBranch');
    
    if (savedUser && token) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      if (parsedUser.role === 'super_admin' || parsedUser.role === 'accountant') {
        setBranch(selectedBranch === 'all' ? 'all' : (selectedBranch ? parseInt(selectedBranch) : null));
      } else {
        setBranch(parsedUser.branch_id);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setBranch(userData.branch_id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setBranch(null);
  };

  const switchBranch = (branchId) => {
    localStorage.setItem('selectedBranch', branchId);
    setBranch(branchId);
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ user, branch, loading, login, logout, switchBranch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
