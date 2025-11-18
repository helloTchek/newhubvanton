import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    const initializeAuth = async () => {
      console.log('Initializing auth...');

      try {
        const currentUser = await Promise.race([
          authService.getCurrentUser(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);

        console.log('Current user:', currentUser);
        if (mounted) {
          setUser(currentUser);
          setIsLoading(false);
          isInitialized = true;
          console.log('Auth initialization complete, loading:', false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
          isInitialized = true;
          console.log('Auth initialization failed, loading:', false);
        }
      }
    };

    initializeAuth();

    const { data: authListener } = authService.onAuthStateChange((newUser) => {
      console.log('Auth state changed:', newUser);

      // Only update user state if initialization is complete
      // This prevents race conditions during initial load
      if (mounted && isInitialized) {
        // If newUser is null and we had a user, only clear if this is an explicit logout
        // Don't clear on token refresh errors
        if (newUser !== null || user !== null) {
          setUser(newUser);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });
      setUser(response.data.user);
    } catch (err: unknown) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    console.log('[AuthContext] updateUser called with:', updatedUser);
    console.log('[AuthContext] Current user before update:', user);

    // Persist to database FIRST before updating local state
    // This prevents the auth listener from overwriting our changes
    try {
      await authService.updateUserProfile({
        company_id: updatedUser.companyId
      });
      console.log('[AuthContext] User profile updated in database successfully');

      // Only update local state after successful DB update
      setUser(updatedUser);
      console.log('[AuthContext] setUser called with updatedUser');
    } catch (err) {
      console.error('[AuthContext] Failed to update user profile:', err);
      // Still update local state even if DB fails
      setUser(updatedUser);
      console.log('[AuthContext] setUser called despite DB error');
    }

    console.log('[AuthContext] updateUser function complete');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
