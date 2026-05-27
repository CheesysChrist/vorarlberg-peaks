'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@vorarlberg-peaks/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const stored = localStorage.getItem('auth_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('access_token');
      }
    }
    setReady(true);
  }, []);

  const login = useCallback((accessToken: string, u: User) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('auth_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  return { user, isAuthenticated: !!user, login, logout, ready };
}
