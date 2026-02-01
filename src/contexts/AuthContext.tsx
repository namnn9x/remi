import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { register as registerApi, login as loginApi, getCurrentUser, User } from '../api/auth';
import { saveToken, removeToken, getToken } from '../utils/auth';
import { ApiError } from '../api/client';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  register: (email: string, password: string, name: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const navigate = useNavigate();

  // Clear error helper
  const clearError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    const token = getToken();
    if (!token) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const user = await getCurrentUser();
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      // Token invalid or expired
      removeToken();
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { user, token } = await registerApi({ email, password, name });
      saveToken(token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/my-books');
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError.error?.message || 'Đăng ký thất bại',
      }));
      throw err;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { user, token } = await loginApi({ email, password });
      saveToken(token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      navigate('/my-books');
    } catch (err) {
      const apiError = err as ApiError;
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: apiError.error?.message || 'Đăng nhập thất bại',
      }));
      throw err;
    }
  };

  // Logout function
  const logout = useCallback(() => {
    removeToken();
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    navigate('/login');
  }, [navigate]);

  // Auto-fetch user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Listen for unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        fetchCurrentUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
