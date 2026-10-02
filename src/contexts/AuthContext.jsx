import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('westy_token');
    const storedUser = localStorage.getItem('westy_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed.user || parsed);
      } catch (e) {
        setUser(null);
      }
      
      // Validate token
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json'
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Token invalid');
        return res.json();
      })
      .then(data => {
        const userData = data.user || data;
        setUser(userData);
        localStorage.setItem('westy_user', JSON.stringify(userData));
      })
      .catch(() => {
        localStorage.removeItem('westy_token');
        localStorage.removeItem('westy_user');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Login failed');
    }
    
    const data = await res.json();
    localStorage.setItem('westy_token', data.token);
    localStorage.setItem('westy_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (username, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Signup failed');
    }
    
    const data = await res.json();
    localStorage.setItem('westy_token', data.token);
    localStorage.setItem('westy_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('westy_token');
    localStorage.removeItem('westy_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const loginWithGoogle = async (credential) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Google login failed');
    }

    const data = await res.json();
    localStorage.setItem('westy_token', data.token);
    localStorage.setItem('westy_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, loginWithGoogle, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
