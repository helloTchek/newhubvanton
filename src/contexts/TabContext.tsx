import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchFilters } from '../types';

export type TabIconType = 'grid' | 'car' | 'none';

export interface Tab {
  id: string;
  title: string;
  path: string;
  isPinned?: boolean;
  iconType?: TabIconType;
  filters?: SearchFilters;
  viewMode?: 'grid' | 'list';
}

interface TabContextType {
  tabs: Tab[];
  activeTabId: string | null;
  addTab: (tab: Omit<Tab, 'id'>) => string;
  removeTab: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  updateTab: (tabId: string, updates: Partial<Tab>) => void;
  closeOtherTabs: (tabId: string) => void;
  closeAllTabs: () => void;
  renameTab: (tabId: string, newTitle: string) => void;
  getTabState: (tabId: string) => { filters?: SearchFilters; viewMode?: 'grid' | 'list' } | undefined;
  setTabState: (tabId: string, state: { filters?: SearchFilters; viewMode?: 'grid' | 'list' }) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const TAB_STORAGE_KEY = 'vehicleDashboardTabs';
const ACTIVE_TAB_STORAGE_KEY = 'vehicleDashboardActiveTab';

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTabs) {
      try {
        return JSON.parse(savedTabs);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    return localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  });

  useEffect(() => {
    localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(tabs));
  }, [tabs]);

  useEffect(() => {
    if (activeTabId) {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTabId);
    } else {
      localStorage.removeItem(ACTIVE_TAB_STORAGE_KEY);
    }
  }, [activeTabId]);

  useEffect(() => {
    if (activeTabId) {
      const activeTab = tabs.find(t => t.id === activeTabId);
      if (activeTab && location.pathname !== activeTab.path) {
        const matchingTab = tabs.find(t => t.path === location.pathname);
        if (matchingTab) {
          setActiveTabId(matchingTab.id);
        }
      }
    }
  }, [location.pathname, activeTabId, tabs]);

  const addTab = useCallback((tab: Omit<Tab, 'id'>) => {
    if (tab.path === '/vehicles') {
      const newTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newTab: Tab = {
        ...tab,
        id: newTabId,
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTabId);
      navigate(tab.path);
      return newTabId;
    }

    const existingTab = tabs.find(t => t.path === tab.path);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      navigate(existingTab.path);
      return existingTab.id;
    }

    const newTabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newTab: Tab = {
      ...tab,
      id: newTabId,
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
    navigate(tab.path);
    return newTabId;
  }, [tabs, navigate]);

  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== tabId);

      if (activeTabId === tabId) {
        const removedIndex = prev.findIndex(t => t.id === tabId);
        if (newTabs.length > 0) {
          const nextTab = newTabs[Math.max(0, removedIndex - 1)];
          setActiveTabId(nextTab.id);
          navigate(nextTab.path);
        } else {
          setActiveTabId(null);
          navigate('/vehicles');
        }
      }

      return newTabs;
    });
  }, [activeTabId, navigate]);

  const switchTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      navigate(tab.path);
    }
  }, [tabs, navigate]);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...updates } : t));
  }, []);

  const closeOtherTabs = useCallback((tabId: string) => {
    setTabs(prev => prev.filter(t => t.id === tabId || t.isPinned));
    setActiveTabId(tabId);
  }, []);

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
    navigate('/vehicles');
  }, [navigate]);

  const renameTab = useCallback((tabId: string, newTitle: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, title: newTitle } : t));
  }, []);

  const getTabState = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    console.log('🔍 getTabState called for tabId:', tabId, 'found tab:', tab);
    if (!tab) return undefined;
    return {
      filters: tab.filters,
      viewMode: tab.viewMode,
    };
  }, [tabs]);

  const setTabState = useCallback((tabId: string, state: { filters?: SearchFilters; viewMode?: 'grid' | 'list' }) => {
    console.log('💾 setTabState called for tabId:', tabId, 'with state:', state);
    setTabs(prev => {
      const updated = prev.map(t => t.id === tabId ? { ...t, ...state } : t);
      console.log('📋 Updated tabs:', updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) {
          removeTab(activeTabId);
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = tabs.findIndex(t => t.id === activeTabId);
        if (currentIndex === -1) return;

        if (e.shiftKey) {
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          switchTab(tabs[prevIndex].id);
        } else {
          const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          switchTab(tabs[nextIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabs, activeTabId, removeTab, switchTab]);

  return (
    <TabContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        removeTab,
        switchTab,
        updateTab,
        closeOtherTabs,
        closeAllTabs,
        renameTab,
        getTabState,
        setTabState,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};

export const useTabs = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTabs must be used within TabProvider');
  }
  return context;
};
