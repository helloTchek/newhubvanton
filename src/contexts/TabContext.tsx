import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SearchFilters } from '../types';

export type TabIconType = 'grid' | 'car' | 'none';

export interface TabViewState {
  filters?: SearchFilters;
  viewMode?: 'grid' | 'list';
  columnOrder?: string[];
  visibleColumns?: Record<string, boolean>;
  visibleCardFields?: Record<string, boolean>;
}

export interface Tab {
  id: string;
  title: string;
  path: string;
  isPinned?: boolean;
  iconType?: TabIconType;
  filters?: SearchFilters;
  viewMode?: 'grid' | 'list';
  columnOrder?: string[];
  visibleColumns?: Record<string, boolean>;
  visibleCardFields?: Record<string, boolean>;
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
  getTabState: (tabId: string) => TabViewState | undefined;
  setTabState: (tabId: string, state: TabViewState) => void;
  resetToDefaultTabs: () => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

const TAB_STORAGE_KEY = 'vehicleDashboardTabs';
const ACTIVE_TAB_STORAGE_KEY = 'vehicleDashboardActiveTab';
const TABS_INITIALIZED_KEY = 'vehicleDashboardTabsInitialized';

const createDefaultTabs = (): Tab[] => {
  const baseTime = Date.now();

  return [
    {
      id: `tab-${baseTime}-1`,
      title: 'Inspected Vehicles',
      path: '/vehicles',
      iconType: 'grid' as TabIconType,
      viewMode: 'grid',
      visibleCardFields: {
        image: true,
        registration: true,
        vin: false,
        makeModel: false,
        age: false,
        mileage: false,
        company: false,
        customerEmail: false,
        inspectionDate: true,
        inspectionId: false,
        repairCost: false,
        value: false,
        damageResults: false,
        tags: false
      },
      filters: {
        query: '',
        status: 'all',
        companyId: 'all',
        inspectionType: 'all',
        dateRange: undefined,
        userId: 'all',
        customerEmail: '',
        customerPhone: '',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20,
        statusIds: ['to_review', 'inspected']
      }
    },
    {
      id: `tab-${baseTime}-2`,
      title: 'All Inspections',
      path: '/vehicles',
      iconType: 'none' as TabIconType,
      viewMode: 'list',
      columnOrder: ['image', 'registration', 'status', 'inspectionDate', 'mileage', 'carBody', 'rim', 'interior', 'tires', 'dashboard'],
      visibleColumns: {
        image: true,
        registration: true,
        vin: false,
        makeModel: false,
        company: false,
        customerEmail: false,
        status: true,
        inspectionDate: true,
        inspectionId: false,
        mileage: true,
        value: false,
        tags: false,
        carBody: true,
        rim: true,
        glass: false,
        interior: true,
        tires: true,
        dashboard: true,
        declarations: false
      },
      filters: {
        query: '',
        status: 'all',
        companyId: 'all',
        inspectionType: 'all',
        dateRange: undefined,
        userId: 'all',
        customerEmail: '',
        customerPhone: '',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20,
        statusIds: ['to_review', 'inspected']
      }
    },
    {
      id: `tab-${baseTime}-3`,
      title: 'Repairs >1000€',
      path: '/vehicles',
      iconType: 'none' as TabIconType,
      viewMode: 'list',
      columnOrder: ['image', 'registration', 'status', 'inspectionDate', 'mileage', 'carBody', 'rim', 'interior', 'tires', 'dashboard'],
      visibleColumns: {
        image: true,
        registration: true,
        vin: false,
        makeModel: false,
        company: false,
        customerEmail: false,
        status: true,
        inspectionDate: true,
        inspectionId: false,
        mileage: true,
        value: false,
        tags: false,
        carBody: true,
        rim: true,
        glass: false,
        interior: true,
        tires: true,
        dashboard: true,
        declarations: false
      },
      filters: {
        query: '',
        status: 'all',
        companyId: 'all',
        inspectionType: 'all',
        dateRange: undefined,
        userId: 'all',
        customerEmail: '',
        customerPhone: '',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20,
        statusIds: ['to_review', 'inspected'],
        repairCostRange: {
          min: 1000
        }
      }
    },
    {
      id: `tab-${baseTime}-4`,
      title: 'Pending Inspections',
      path: '/vehicles',
      iconType: 'none' as TabIconType,
      viewMode: 'list',
      columnOrder: ['image', 'registration', 'status', 'inspectionDate', 'mileage', 'carBody', 'rim', 'interior', 'tires', 'dashboard'],
      visibleColumns: {
        image: true,
        registration: true,
        vin: false,
        makeModel: false,
        company: false,
        customerEmail: false,
        status: true,
        inspectionDate: true,
        inspectionId: false,
        mileage: true,
        value: false,
        tags: false,
        carBody: true,
        rim: true,
        glass: false,
        interior: true,
        tires: true,
        dashboard: true,
        declarations: false
      },
      filters: {
        query: '',
        status: 'all',
        companyId: 'all',
        inspectionType: 'all',
        dateRange: undefined,
        userId: 'all',
        customerEmail: '',
        customerPhone: '',
        sortBy: 'date',
        sortOrder: 'desc',
        page: 1,
        pageSize: 20,
        statusIds: ['link_sent', 'chased_up_1', 'chased_up_2', 'chased_up_manual', 'inspection_in_progress']
      }
    }
  ];
};

export const TabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const savedTabs = localStorage.getItem(TAB_STORAGE_KEY);
    const isInitialized = localStorage.getItem(TABS_INITIALIZED_KEY);

    if (savedTabs && isInitialized) {
      try {
        return JSON.parse(savedTabs);
      } catch {
        const defaultTabs = createDefaultTabs();
        localStorage.setItem(TABS_INITIALIZED_KEY, 'true');
        return defaultTabs;
      }
    }

    const defaultTabs = createDefaultTabs();
    localStorage.setItem(TABS_INITIALIZED_KEY, 'true');
    return defaultTabs;
  });
  const [activeTabId, setActiveTabId] = useState<string | null>(() => {
    const savedActiveTab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    if (savedActiveTab) {
      return savedActiveTab;
    }
    return tabs.length > 0 ? tabs[0].id : null;
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
      // Don't allow closing the last tab
      if (prev.length <= 1) {
        return prev;
      }

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
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id === tabId || t.isPinned);
      // Ensure at least one tab remains
      return newTabs.length > 0 ? newTabs : prev;
    });
    setActiveTabId(tabId);
  }, []);

  const closeAllTabs = useCallback(() => {
    // Don't allow closing all tabs - keep at least one
    setTabs(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      // Keep the first tab
      const firstTab = prev[0];
      setActiveTabId(firstTab.id);
      navigate(firstTab.path);
      return [firstTab];
    });
  }, [navigate]);

  const renameTab = useCallback((tabId: string, newTitle: string) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, title: newTitle } : t));
  }, []);

  const getTabState = useCallback((tabId: string): TabViewState | undefined => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return undefined;
    return {
      filters: tab.filters,
      viewMode: tab.viewMode,
      columnOrder: tab.columnOrder,
      visibleColumns: tab.visibleColumns,
      visibleCardFields: tab.visibleCardFields,
    };
  }, [tabs]);

  const setTabState = useCallback((tabId: string, state: TabViewState) => {
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, ...state } : t));
  }, []);

  const resetToDefaultTabs = useCallback(() => {
    const defaultTabs = createDefaultTabs();
    setTabs(defaultTabs);
    setActiveTabId(defaultTabs[0].id);
    navigate('/vehicles');
    localStorage.removeItem(TABS_INITIALIZED_KEY);
    localStorage.setItem(TABS_INITIALIZED_KEY, 'true');
  }, [navigate]);

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
        resetToDefaultTabs,
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
