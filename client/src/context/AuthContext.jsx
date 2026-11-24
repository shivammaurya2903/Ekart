import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  STORAGE_KEYS,
  fetchProfile,
  getAuthToken,
  isDemoToken,
  isNetworkError,
  loginRequest,
  registerRequest,
  setAuthToken
} from '../services/api';

const DEMO_USERS = {
  'admin@ekart.com': {
    password: 'Admin@123',
    user: { id: 'demo-admin', name: 'Ekart Admin', email: 'admin@ekart.com', role: 'admin' }
  },
  'user@ekart.com': {
    password: 'User@123',
    user: { id: 'demo-customer', name: 'Demo Customer', email: 'user@ekart.com', role: 'customer' }
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => getAuthToken());
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null');
    } catch (error) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.user);
    }
  }, [user]);

  useEffect(() => {
    if (!token || isDemoToken(token)) {
      return undefined;
    }

    let active = true;

    fetchProfile()
      .then((data) => {
        if (active && data.user) {
          setUser(data.user);
        }
      })
      .catch((error) => {
        if (active && error.response && error.response.status === 401) {
          logout();
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  const saveSession = (session) => {
    setAuthToken(session.token);
    setToken(session.token);
    setUser(session.user);
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const session = await loginRequest(credentials);
      saveSession(session);
      return session.user;
    } catch (error) {
      if (isNetworkError(error)) {
        const email = String(credentials.email || '').trim().toLowerCase();
        const demoUser = DEMO_USERS[email];

        if (demoUser && demoUser.password === credentials.password) {
          const session = {
            token: `demo-${demoUser.user.role}-${Date.now()}`,
            user: demoUser.user
          };

          saveSession(session);
          return demoUser.user;
        }
      }

      throw new Error(error.normalizedMessage || 'Unable to log in right now');
    } finally {
      setLoading(false);
    }
  };

  const register = async (details) => {
    setLoading(true);

    try {
      const session = await registerRequest(details);
      saveSession(session);
      return session.user;
    } catch (error) {
      if (isNetworkError(error)) {
        const email = String(details.email || '').trim().toLowerCase();

        if (DEMO_USERS[email]) {
          throw new Error('This demo email is already registered. Please log in instead.');
        }

        const session = {
          token: `demo-customer-${Date.now()}`,
          user: {
            id: `demo-${Date.now()}`,
            name: details.name.trim(),
            email,
            role: 'customer'
          }
        };

        saveSession(session);
        return session.user;
      }

      throw new Error(error.normalizedMessage || 'Unable to register right now');
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    isAdmin: Boolean(user && user.role === 'admin'),
    login,
    register,
    logout
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
