// AuthContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('inventory-auth-token');
    setIsAuthenticated(!!token);
  }, []); // This effect runs on initial load

  const login = (token) => {
    localStorage.setItem('inventory-auth-token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('inventory-auth-token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

