import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeConfiguration } from '../types/theme';
import { themeService } from '../services/themeService';
import { useAuth } from './AuthContext';

interface ThemeContextType {
  theme: ThemeConfiguration | null;
  isLoading: boolean;
  refreshTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const defaultTheme: ThemeConfiguration = {
  id: 'default',
  companyId: '',
  logoUrl: '',
  logoDarkUrl: undefined,
  primaryColor: '#0062FF',
  accentColor: '#1ADC6A',
  dominantColor: '#111827',
  textPrimaryColor: '#111827',
  backgroundPrimaryColor: '#F7F8FA',
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: ''
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [theme, setTheme] = useState<ThemeConfiguration | null>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  const loadTheme = async () => {
    setIsLoading(true);
    try {
      if (profile?.companyId) {
        const companyTheme = await themeService.getThemeByCompanyId(profile.companyId);
        setTheme(companyTheme || defaultTheme);
      } else {
        const activeTheme = await themeService.getActiveTheme();
        setTheme(activeTheme || defaultTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setTheme(defaultTheme);
    } finally {
      setIsLoading(false);
    }
  };

  const applyThemeColors = (themeConfig: ThemeConfiguration) => {
    const root = document.documentElement;

    root.style.setProperty('--color-primary', themeConfig.primaryColor);
    root.style.setProperty('--color-accent', themeConfig.accentColor);
    root.style.setProperty('--color-dominant', themeConfig.dominantColor);
    root.style.setProperty('--color-text-primary', themeConfig.textPrimaryColor);
    root.style.setProperty('--color-background-primary', themeConfig.backgroundPrimaryColor);
  };

  useEffect(() => {
    loadTheme();
  }, [user, profile?.companyId]);

  useEffect(() => {
    if (theme) {
      applyThemeColors(theme);
    }
  }, [theme]);

  const refreshTheme = async () => {
    await loadTheme();
  };

  return (
    <ThemeContext.Provider value={{ theme, isLoading, refreshTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
