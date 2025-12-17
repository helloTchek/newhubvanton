import React, { useState, useEffect, useLayoutEffect, useCallback, useMemo, useRef } from 'react';
import { Search, Filter, Grid2x2 as Grid, List, Plus, CheckSquare, X, Bell, Archive, ArchiveRestore, ArrowUpDown, Columns3, ArrowUp, ArrowDown, GripVertical, Tag as TagIcon, Share2, Download, ExternalLink, FileText, ChevronDown, Wrench, DollarSign } from 'lucide-react';
import { Building2 } from 'lucide-react';
import { Vehicle, SearchFilters, LoadingState, VehicleStatus, Company, SortField, PaginationMetadata } from '../../types';
import { vehicleService } from '../../services/vehicleService';
import { companyService } from '../../services/companyService';
import { chaseUpService } from '../../services/chaseUpService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Pagination } from '../common/Pagination';
import { VehicleCard } from './VehicleCard';
import { VehicleTableRow } from './VehicleTableRow';
import { FilterPanel } from './FilterPanel';
import { BulkChaseUpModal } from './BulkChaseUpModal';
import { ChaseUpModal } from './ChaseUpModal';
import { BulkTagModal } from './BulkTagModal';
import { ShareReportModal } from './ShareReportModal';
import { shareService } from '../../services/shareService';
import { tagService } from '../../services/tagService';
import { userPreferencesService } from '../../services/userPreferencesService';
import { internalEventsService } from '../../services/internalEventsService';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTabs } from '../../contexts/TabContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const statusOptions: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'created', label: 'Created' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' }
];

export const VehicleList: React.FC = () => {
  const { user } = useAuth();
  const { addTab, activeTabId, getTabState, setTabState, tabs } = useTabs();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true, error: null });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  const isLoadingTabStateRef = React.useRef(false);
  const previousTabIdRef = React.useRef<string | null>(null);
  const [isTabSwitching, setIsTabSwitching] = useState(false);
  const [filterPanelKey, setFilterPanelKey] = useState(0);
  // Cache vehicles per tab to avoid reloading when switching tabs
  const vehicleCacheRef = React.useRef<Map<string, { vehicles: Vehicle[]; pagination: PaginationMetadata }>>(new Map());
  const [pagination, setPagination] = useState<PaginationMetadata>({
    currentPage: 1,
    pageSize: 20,
    totalItems: 0,
    totalPages: 0
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isBulkChaseUpModalOpen, setIsBulkChaseUpModalOpen] = useState(false);
  const [isChaseUpModalOpen, setIsChaseUpModalOpen] = useState(false);
  const [vehicleToChaseUp, setVehicleToChaseUp] = useState<Vehicle | null>(null);
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [showCardFieldSelector, setShowCardFieldSelector] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [vehicleToShare, setVehicleToShare] = useState<Vehicle | null>(null);
  const [shareStatus, setShareStatus] = useState<'never_shared' | 'up_to_date' | 'needs_sharing'>('needs_sharing');
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
  const [openMenuVehicleId, setOpenMenuVehicleId] = useState<string | null>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const bulkActionsMenuRef = useRef<HTMLDivElement>(null);

  // Default values for view state
  const defaultVisibleColumns = {
    image: true,
    registration: true,
    vin: true,
    makeModel: true,
    company: true,
    customerEmail: true,
    status: true,
    inspectionDate: true,
    inspectionId: true,
    externalId: true,
    inspectionType: true,
    aiInspectionBadge: true,
    mileage: true,
    value: true,
    repairCost: true,
    tags: true,
    carBody: true,
    rim: true,
    glass: true,
    interior: true,
    tires: true,
    dashboard: true,
    declarations: true
  };

  const defaultVisibleCardFields = {
    image: true,
    registration: true,
    vin: true,
    makeModel: true,
    age: true,
    mileage: true,
    company: true,
    customerEmail: true,
    inspectionDate: true,
    inspectionId: true,
    externalId: true,
    inspectionType: true,
    aiInspectionBadge: true,
    repairCost: true,
    value: true,
    damageResults: true,
    tags: true
  };

  const defaultColumnOrder = [
    'image', 'registration', 'vin', 'makeModel', 'company', 'customerEmail', 'status', 'inspectionDate', 'inspectionId', 'externalId', 'inspectionType', 'aiInspectionBadge',
    'mileage', 'value', 'repairCost', 'tags', 'carBody', 'rim', 'glass',
    'interior', 'tires', 'dashboard', 'declarations'
  ];

  // Derive column/field visibility from tab state
  const visibleColumns = useMemo(() => {
    if (!activeTabId) return defaultVisibleColumns;
    const currentTab = tabs.find(t => t.id === activeTabId);
    return currentTab?.visibleColumns || defaultVisibleColumns;
  }, [activeTabId, tabs]);

  const visibleCardFields = useMemo(() => {
    if (!activeTabId) return defaultVisibleCardFields;
    const currentTab = tabs.find(t => t.id === activeTabId);
    return currentTab?.visibleCardFields || defaultVisibleCardFields;
  }, [activeTabId, tabs]);

  const columnOrder = useMemo(() => {
    if (!activeTabId) return defaultColumnOrder;
    const currentTab = tabs.find(t => t.id === activeTabId);
    return currentTab?.columnOrder || defaultColumnOrder;
  }, [activeTabId, tabs]);

  // Derive filters directly from tab state to avoid stale values during tab switches
  const filters = useMemo(() => {
    if (!activeTabId) {
      return {
        query: '',
        status: 'all' as const,
        companyId: user?.companyId || 'all',
        inspectionType: 'all' as const,
        dateRange: undefined,
        userId: 'all',
        customerEmail: '',
        customerPhone: '',
        sortBy: 'date' as const,
        sortOrder: 'desc' as const,
        page: 1,
        pageSize: 20
      };
    }
    const currentTab = tabs.find(t => t.id === activeTabId);
    return currentTab?.filters || {
      query: '',
      status: 'all' as const,
      companyId: user?.companyId || 'all',
      inspectionType: 'all' as const,
      dateRange: undefined,
      userId: 'all',
      customerEmail: '',
      customerPhone: '',
      sortBy: 'date' as const,
      sortOrder: 'desc' as const,
      page: 1,
      pageSize: 20
    };
  }, [activeTabId, tabs, user?.companyId]);

  const loadVehicles = useCallback(async (skipCache = false) => {
    if (!activeTabId) return;

    // Create cache key from tab ID and current filters
    const cacheKey = `${activeTabId}-${JSON.stringify(filters)}`;

    // Check cache first (unless explicitly skipping)
    if (!skipCache && vehicleCacheRef.current.has(cacheKey)) {
      const cached = vehicleCacheRef.current.get(cacheKey)!;
      console.log('VehicleList using cached data for:', cacheKey);
      setVehicles(cached.vehicles);
      setPagination(cached.pagination);
      setLoading({ isLoading: false, error: null });
      return;
    }

    try {
      console.log('VehicleList loadVehicles called with filters:', filters);
      setLoading({ isLoading: true, error: null });
      const response = await vehicleService.getVehicles(filters);
      console.log('VehicleList received response:', { vehicleCount: response.data.length, pagination: response.pagination });

      // Update cache
      vehicleCacheRef.current.set(cacheKey, {
        vehicles: response.data,
        pagination: response.pagination || pagination
      });

      setVehicles(response.data);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error: unknown) {
      console.error('VehicleList error:', error);
      const errorMessage = error.message || 'Failed to load vehicles';
      setLoading({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, isLoading: false }));
    }
  }, [filters, activeTabId, pagination]);

  const loadCompanies = async () => {
    try {
      const response = await companyService.getCompanies();
      setCompanies(response.data);
    } catch (error: unknown) {
      console.error('Failed to load companies:', error);
    }
  };

  const loadUserPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const preferences = await userPreferencesService.getUserPreferences(user.id);

      if (preferences) {
        setViewMode(preferences.viewMode);
        // Note: filters, columnOrder, visibleColumns, visibleCardFields are now derived from tab state
        // User preferences are loaded but overridden by tab-specific state
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    } finally {
      setPreferencesLoaded(true);
    }
  }, [user?.id]);

  const saveUserPreferences = useCallback(async () => {
    if (!user?.id || !preferencesLoaded) return;

    try {
      await userPreferencesService.saveUserPreferences({
        userId: user.id,
        viewMode,
        filters: {
          query: filters.query,
          status: filters.status,
          companyId: filters.companyId,
          inspectionType: filters.inspectionType,
          userId: filters.userId,
          customerEmail: filters.customerEmail,
          customerPhone: filters.customerPhone
        },
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        columnOrder,
        visibleColumns,
        visibleCardFields
      });
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }, [user?.id, preferencesLoaded, viewMode, filters, columnOrder, visibleColumns, visibleCardFields]);

  useEffect(() => {
    loadUserPreferences();
  }, [loadUserPreferences]);

  useEffect(() => {
    loadCompanies();
  }, []);

  // Sync scrollbars
  useEffect(() => {
    const tableScroll = tableScrollRef.current;
    const scrollbar = scrollbarRef.current;

    if (!tableScroll || !scrollbar || viewMode !== 'list') return;

    const updateScrollbarWidth = () => {
      const innerDiv = scrollbar.querySelector('div');
      if (innerDiv) {
        innerDiv.style.width = `${tableScroll.scrollWidth}px`;
      }
    };

    const syncTableToScrollbar = () => {
      scrollbar.scrollLeft = tableScroll.scrollLeft;
    };

    const syncScrollbarToTable = () => {
      tableScroll.scrollLeft = scrollbar.scrollLeft;
    };

    updateScrollbarWidth();
    tableScroll.addEventListener('scroll', syncTableToScrollbar);
    scrollbar.addEventListener('scroll', syncScrollbarToTable);

    const resizeObserver = new ResizeObserver(updateScrollbarWidth);
    resizeObserver.observe(tableScroll);

    return () => {
      tableScroll.removeEventListener('scroll', syncTableToScrollbar);
      scrollbar.removeEventListener('scroll', syncScrollbarToTable);
      resizeObserver.disconnect();
    };
  }, [viewMode, vehicles, visibleColumns]);


  useEffect(() => {
    if (!activeTabId) {
      addTab({
        title: 'All Vehicles',
        path: '/vehicles',
        iconType: 'grid',
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bulkActionsMenuRef.current && !bulkActionsMenuRef.current.contains(event.target as Node)) {
        setShowBulkActionsMenu(false);
      }
    };

    if (showBulkActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBulkActionsMenu]);

  useLayoutEffect(() => {
    if (activeTabId && preferencesLoaded) {
      if (previousTabIdRef.current !== activeTabId) {
        previousTabIdRef.current = activeTabId;
        isLoadingTabStateRef.current = true;
        setIsTabSwitching(true);

        const tabState = getTabState(activeTabId);

        if (tabState && tabState.viewMode !== undefined) {
          setViewMode(tabState.viewMode);
        } else {
          setViewMode('grid');
        }

        // Load cached vehicles immediately if available
        const cacheKey = `${activeTabId}-${JSON.stringify(filters)}`;
        if (vehicleCacheRef.current.has(cacheKey)) {
          const cached = vehicleCacheRef.current.get(cacheKey)!;
          setVehicles(cached.vehicles);
          setPagination(cached.pagination);
          setLoading({ isLoading: false, error: null });
        }

        // Increment key to force FilterPanel remount with correct props
        setTimeout(() => {
          setFilterPanelKey(prev => prev + 1);
          setIsTabSwitching(false);
          isLoadingTabStateRef.current = false;
        }, 0);
      }
    }
  }, [activeTabId, preferencesLoaded, getTabState, filters]);

  useEffect(() => {
    if (activeTabId && preferencesLoaded && !isLoadingTabStateRef.current) {
      const saveTimer = setTimeout(() => {
        setTabState(activeTabId, { viewMode });
      }, 500);
      return () => clearTimeout(saveTimer);
    }
  }, [viewMode, activeTabId, preferencesLoaded, setTabState]);

  useEffect(() => {
    if (!preferencesLoaded) return;

    const debounceTimer = setTimeout(() => {
      loadVehicles();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [filters, loadVehicles, preferencesLoaded]);

  // Restore scroll position when returning to the list
  useEffect(() => {
    if (!loading.isLoading && vehicles.length > 0) {
      const savedScrollPosition = sessionStorage.getItem('vehicleListScrollPosition');
      if (savedScrollPosition) {
        // Use requestAnimationFrame to ensure DOM is fully rendered
        requestAnimationFrame(() => {
          window.scrollTo({
            top: parseInt(savedScrollPosition, 10),
            behavior: 'instant'
          });
          // Clear the saved position after restoring
          sessionStorage.removeItem('vehicleListScrollPosition');
        });
      }
    }
  }, [loading.isLoading, vehicles.length]);

  useEffect(() => {
    if (!preferencesLoaded) return;

    const saveTimer = setTimeout(() => {
      saveUserPreferences();
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [viewMode, filters, columnOrder, visibleColumns, visibleCardFields, saveUserPreferences, preferencesLoaded]);

  const handleVehicleClick = (vehicle: Vehicle) => {
    // Save current scroll position before navigating
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    sessionStorage.setItem('vehicleListScrollPosition', scrollPosition.toString());
    navigate(`/vehicles/${vehicle.id}/report`);
  };

  const handleChaseUpClick = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setVehicleToChaseUp(vehicle);
      setIsChaseUpModalOpen(true);
    }
  };

  const handleChaseUp = async (vehicleId: string, method: 'email' | 'sms', message?: string) => {
    try {
      await chaseUpService.sendChaseUp(vehicleId, method, message);
      toast.success(`Chase up ${method} sent successfully`);
      await loadVehicles(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send chase up';
      toast.error(errorMessage);
      throw error;
    }
  };

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    if (activeTabId) {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setTabState(activeTabId, { filters: updatedFilters });
    }
  }, [activeTabId, filters, setTabState]);

  const handlePageChange = (page: number) => {
    if (activeTabId) {
      const updatedFilters = { ...filters, page };
      setTabState(activeTabId, { filters: updatedFilters });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (pageSize: number) => {
    if (activeTabId) {
      const updatedFilters = { ...filters, pageSize, page: 1 };
      setTabState(activeTabId, { filters: updatedFilters });
    }
  };

  const updateVisibleColumns = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    if (activeTabId) {
      const updated = updater(visibleColumns);
      setTabState(activeTabId, { visibleColumns: updated });
    }
  }, [activeTabId, visibleColumns, setTabState]);

  const updateVisibleCardFields = useCallback((updater: (prev: Record<string, boolean>) => Record<string, boolean>) => {
    if (activeTabId) {
      const updated = updater(visibleCardFields);
      setTabState(activeTabId, { visibleCardFields: updated });
    }
  }, [activeTabId, visibleCardFields, setTabState]);

  const updateColumnOrder = useCallback((newOrder: string[]) => {
    if (activeTabId) {
      setTabState(activeTabId, { columnOrder: newOrder });
    }
  }, [activeTabId, setTabState]);

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedVehicleIds([]);
  };

  const handleSelectToggle = (vehicleId: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(vehicleId)
        ? prev.filter(id => id !== vehicleId)
        : [...prev, vehicleId]
    );
  };

  const handleSelectAll = () => {
    if (selectedVehicleIds.length === vehicles.length) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(vehicles.map(v => v.id));
    }
  };

  const handleBulkChaseUp = async (method: 'email' | 'sms') => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    try {
      await chaseUpService.sendBulkChaseUp(selectedVehicleIds, method);
      toast.success(`Bulk chase up ${method} sent to ${selectedVehicleIds.length} customer${selectedVehicleIds.length !== 1 ? 's' : ''}`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to send bulk chase up');
      throw error;
    }
  };

  const handleBulkArchive = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    try {
      await vehicleService.archiveVehicles(selectedVehicleIds);
      toast.success(`${selectedVehicleIds.length} vehicle${selectedVehicleIds.length > 1 ? 's' : ''} archived successfully`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to archive vehicles');
    }
  };

  const handleBulkUnarchive = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    try {
      await vehicleService.unarchiveVehicles(selectedVehicleIds);
      toast.success(`${selectedVehicleIds.length} vehicle${selectedVehicleIds.length > 1 ? 's' : ''} unarchived successfully`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to unarchive vehicles');
    }
  };

  const handleUnarchiveClick = async (vehicleId: string) => {
    try {
      await vehicleService.unarchiveVehicles([vehicleId]);
      toast.success('Vehicle unarchived successfully');
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to unarchive vehicle');
    }
  };

  const handleBulkTagApplied = async (tagId: string) => {
    if (selectedVehicleIds.length === 0 || !tagId) {
      toast.error('No vehicles or tag selected');
      return;
    }

    try {
      await tagService.addTagToMultipleVehicles(selectedVehicleIds, tagId);
      toast.success(`Tag applied to ${selectedVehicleIds.length} vehicle${selectedVehicleIds.length !== 1 ? 's' : ''}`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      setIsBulkTagModalOpen(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to apply tag');
      throw error;
    }
  };

  const handleBulkShareReport = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    const vehiclesWithReports = selectedVehicles.filter(v => v.reportId);

    if (vehiclesWithReports.length === 0) {
      toast.error('None of the selected vehicles have reports available');
      return;
    }

    try {
      for (const vehicle of vehiclesWithReports) {
        if (vehicle.reportId) {
          const sharedAt = new Date().toISOString();
          await internalEventsService.createEvent({
            eventType: 'report_shared_internal',
            reportId: vehicle.reportId,
            vehicleId: vehicle.id,
            eventData: {
              registration: vehicle.registration,
              sharedAt,
            }
          });

          await supabase
            .from('inspection_reports')
            .update({ last_shared_at: sharedAt })
            .eq('id', vehicle.reportId);
        }
      }

      toast.success(`${vehiclesWithReports.length} report${vehiclesWithReports.length !== 1 ? 's' : ''} shared successfully`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to share reports');
    }
  };

  const handleBulkDownload = async (withCosts: boolean) => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    const vehiclesWithReports = selectedVehicles.filter(v => v.reportId);

    if (vehiclesWithReports.length === 0) {
      toast.error('None of the selected vehicles have reports available');
      return;
    }

    toast.success(`Downloading ${vehiclesWithReports.length} report${vehiclesWithReports.length !== 1 ? 's' : ''} ${withCosts ? 'with' : 'without'} repair costs`);

    // Simulate download - in production, this would trigger actual PDF downloads
    for (const vehicle of vehiclesWithReports) {
      console.log(`Download report for ${vehicle.registration} ${withCosts ? 'with' : 'without'} costs`);
    }
  };

  const handleBulkOpen = async (withCosts: boolean) => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    const vehiclesWithReports = selectedVehicles.filter(v => v.reportId);

    if (vehiclesWithReports.length === 0) {
      toast.error('None of the selected vehicles have reports available');
      return;
    }

    if (vehiclesWithReports.length > 5) {
      const confirmed = window.confirm(`You are about to open ${vehiclesWithReports.length} reports in new tabs. Continue?`);
      if (!confirmed) return;
    }

    vehiclesWithReports.forEach(vehicle => {
      const url = `/vehicles/${vehicle.id}/report?costs=${withCosts}`;
      window.open(url, '_blank');
    });

    toast.success(`Opened ${vehiclesWithReports.length} report${vehiclesWithReports.length !== 1 ? 's' : ''} ${withCosts ? 'with' : 'without'} repair costs`);
  };

  const handleBulkExportData = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));

    try {
      // Create CSV data
      const headers = ['Registration', 'VIN', 'Make', 'Model', 'Status', 'Inspection Date', 'Mileage', 'Repair Cost', 'Value'];
      const rows = selectedVehicles.map(v => [
        v.registration,
        v.vin || '',
        v.make,
        v.model,
        v.status,
        new Date(v.inspectionDate).toLocaleDateString(),
        v.mileage?.toString() || '',
        v.repairCost?.toString() || '',
        v.value?.toString() || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `vehicles_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${selectedVehicles.length} vehicle${selectedVehicles.length !== 1 ? 's' : ''} to CSV`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to export data');
    }
  };

  const handleBulkRequestBodyShopQuote = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    const vehiclesWithReports = selectedVehicles.filter(v => v.reportId);

    if (vehiclesWithReports.length === 0) {
      toast.error('None of the selected vehicles have reports available');
      return;
    }

    try {
      for (const vehicle of vehiclesWithReports) {
        if (vehicle.reportId) {
          await internalEventsService.createEvent({
            eventType: 'quote_requested',
            reportId: vehicle.reportId,
            vehicleId: vehicle.id,
            eventData: {
              registration: vehicle.registration,
              requestedAt: new Date().toISOString(),
              quoteType: 'body_shop'
            }
          });
        }
      }

      toast.success(`Body shop quote requested for ${vehiclesWithReports.length} vehicle${vehiclesWithReports.length !== 1 ? 's' : ''}`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to request body shop quotes');
    }
  };

  const handleBulkSubmitBuybackRequest = async () => {
    if (selectedVehicleIds.length === 0) {
      toast.error('No vehicles selected');
      return;
    }

    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    const vehiclesWithReports = selectedVehicles.filter(v => v.reportId);

    if (vehiclesWithReports.length === 0) {
      toast.error('None of the selected vehicles have reports available');
      return;
    }

    try {
      for (const vehicle of vehiclesWithReports) {
        if (vehicle.reportId) {
          await internalEventsService.createEvent({
            eventType: 'buyback_requested',
            reportId: vehicle.reportId,
            vehicleId: vehicle.id,
            eventData: {
              registration: vehicle.registration,
              requestedAt: new Date().toISOString(),
              repairCost: vehicle.repairCost,
              value: vehicle.value
            }
          });
        }
      }

      toast.success(`Buyback request submitted for ${vehiclesWithReports.length} vehicle${vehiclesWithReports.length !== 1 ? 's' : ''}`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles(true);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit buyback requests');
    }
  };

  const handleDragStart = (columnId: string) => {
    setDraggedColumn(columnId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === columnId) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(columnId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);
    updateColumnOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
  };

  const handleSort = (field: SortField) => {
    if (filters.sortBy === field) {
      updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateFilters({ sortBy: field, sortOrder: 'desc' });
    }
  };

  const getSortableField = (columnId: string): SortField | null => {
    const sortableMap: Record<string, SortField> = {
      'registration': 'registration',
      'makeModel': 'make',
      'inspectionDate': 'date',
      'mileage': 'mileage',
      'value': 'value',
      'status': 'status'
    };
    return sortableMap[columnId] || null;
  };

  const handleShareReport = async (vehicle: Vehicle) => {
    if (!vehicle.reportId) {
      toast.error('No report available to share');
      return;
    }

    setVehicleToShare(vehicle);
    setIsShareModalOpen(true);

    // Fetch share status
    const status = await shareService.getReportShareStatus(vehicle.reportId);
    setShareStatus(status);
  };

  const handleShareSubmit = async (recipients: string[], message?: string) => {
    if (!vehicleToShare?.reportId) {
      toast.error('No report selected');
      return;
    }

    try {
      await shareService.shareReport({
        reportId: vehicleToShare.reportId,
        vehicleId: vehicleToShare.id,
        sharedTo: recipients,
        message
      });
      await loadVehicles(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report';
      throw new Error(errorMessage);
    }
  };

  const handleShareInternal = async () => {
    if (!vehicleToShare?.reportId) {
      toast.error('No report selected');
      return;
    }

    try {
      const sharedAt = new Date().toISOString();

      // Create internal event
      await internalEventsService.createEvent({
        eventType: 'report_shared_internal',
        reportId: vehicleToShare.reportId,
        vehicleId: vehicleToShare.id,
        eventData: {
          registration: vehicleToShare.registration,
          sharedAt,
        }
      });

      // Update the inspection report's last_shared_at timestamp directly
      const { error: updateError } = await supabase
        .from('inspection_reports')
        .update({ last_shared_at: sharedAt })
        .eq('id', vehicleToShare.reportId);

      if (updateError) {
        throw updateError;
      }

      await loadVehicles(true);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report internally';
      throw new Error(errorMessage);
    }
  };

  const getColumnLabel = (columnId: string): string => {
    const labels: Record<string, string> = {
      'image': 'Image',
      'registration': 'License Plate',
      'vin': 'VIN Number',
      'makeModel': 'Brand & Model',
      'company': 'Company',
      'customerEmail': 'Customer Email',
      'status': 'Status',
      'inspectionDate': 'Inspection Date',
      'inspectionId': 'Inspection ID',
      'externalId': 'External ID',
      'inspectionType': 'Inspection Type',
      'aiInspectionBadge': 'AI Inspection Badge',
      'mileage': 'Mileage',
      'value': 'Value',
      'repairCost': 'Repair Cost',
      'tags': 'Tags',
      'carBody': 'Car Body',
      'rim': 'Rim',
      'glass': 'Glass',
      'interior': 'Interior',
      'tires': 'Tires',
      'dashboard': 'Dashboard',
      'declarations': 'Declarations'
    };
    return labels[columnId] || columnId;
  };

  const renderColumnHeader = (columnId: string, align: 'left' | 'center' = 'left') => {
    const sortableField = getSortableField(columnId);
    const isSorted = sortableField && filters.sortBy === sortableField;
    const alignClass = align === 'center' ? 'text-center justify-center' : 'text-left';

    return (
      <th
        key={columnId}
        draggable
        onDragStart={() => handleDragStart(columnId)}
        onDragOver={(e) => handleDragOver(e, columnId)}
        onDragEnd={handleDragEnd}
        className={clsx(
          'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider select-none',
          'cursor-move hover:bg-gray-100 transition-colors',
          draggedColumn === columnId && 'opacity-50'
        )}
      >
        <div className={clsx('flex items-center gap-2', alignClass)}>
          <GripVertical className="w-3 h-3 text-gray-400" />
          <span>{getColumnLabel(columnId)}</span>
          {sortableField && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSort(sortableField);
              }}
              className="ml-1 p-0.5 hover:bg-gray-200 rounded transition-colors"
            >
              {isSorted ? (
                filters.sortOrder === 'asc' ? (
                  <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                )
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </th>
    );
  };

  const canChaseUpSelection = () => {
    const selectedVehicles = vehicles.filter(v => selectedVehicleIds.includes(v.id));
    return selectedVehicles.every(v =>
      ['link_sent', 'chased_up', 'inspection_in_progress'].includes(v.status)
    );
  };

  if (loading.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading vehicles..." />
      </div>
    );
  }

  if (loading.error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{loading.error}</p>
        <button
          onClick={loadVehicles}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Compact Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by registration, make, model, VIN, customer..."
              value={filters.query}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Filter Toggle with Badge */}
            {!isTabSwitching && activeTabId && (
              <FilterPanel
                key={filterPanelKey}
                filters={filters}
                onFiltersChange={updateFilters}
                companies={companies}
                showCompanyFilter={user?.companyId === 'all'}
                visibleColumns={viewMode === 'list' ? visibleColumns : visibleCardFields}
              />
            )}

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'p-2 transition-colors',
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'p-2 transition-colors',
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Columns Selector */}
            <div className="relative">
              <button
                onClick={() => viewMode === 'grid' ? setShowCardFieldSelector(!showCardFieldSelector) : setShowColumnSelector(!showColumnSelector)}
                className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
                title="Columns"
              >
                <Columns3 className="w-4 h-4" />
              </button>

              {viewMode === 'grid' && showCardFieldSelector && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowCardFieldSelector(false)}
                  />
                  <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] max-h-96 overflow-y-auto left-0 sm:left-auto sm:right-0">
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Visible Fields</p>
                      <div className="space-y-2">
                        {Object.entries({
                          image: 'Image',
                          registration: 'License Plate',
                          vin: 'VIN Number',
                          makeModel: 'Brand & Model',
                          age: 'Age',
                          mileage: 'Mileage',
                          company: 'Company',
                          customerEmail: 'Customer Email',
                          inspectionDate: 'Inspection Date',
                          inspectionId: 'Inspection ID',
                          externalId: 'External ID',
                          inspectionType: 'Inspection Type',
                          aiInspectionBadge: 'AI Inspection Badge',
                          repairCost: 'Repair Cost',
                          value: 'Estimated Value',
                          damageResults: 'Damage Results',
                          tags: 'Tags'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={visibleCardFields[key as keyof typeof visibleCardFields]}
                              onChange={(e) =>
                                updateVisibleCardFields(prev => ({ ...prev, [key]: e.target.checked }))
                              }
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {viewMode === 'list' && showColumnSelector && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setShowColumnSelector(false)}
                  />
                  <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] max-h-96 overflow-y-auto left-0 sm:left-auto sm:right-0">
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Visible Columns</p>
                      <div className="space-y-2">
                        {Object.entries({
                          image: 'Image',
                          registration: 'License Plate',
                          vin: 'VIN Number',
                          makeModel: 'Brand & Model',
                          company: 'Company',
                          customerEmail: 'Customer Email',
                          status: 'Status',
                          inspectionDate: 'Inspection Date',
                          inspectionId: 'Inspection ID',
                          externalId: 'External ID',
                          inspectionType: 'Inspection Type',
                          aiInspectionBadge: 'AI Inspection Badge',
                          mileage: 'Mileage',
                          value: 'Value',
                          repairCost: 'Repair Cost',
                          tags: 'Tags',
                          carBody: 'Car Body',
                          rim: 'Rim',
                          glass: 'Glass',
                          interior: 'Interior',
                          tires: 'Tires',
                          dashboard: 'Dashboard',
                          declarations: 'Declarations'
                        }).map(([key, label]) => (
                          <label key={key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={visibleColumns[key as keyof typeof visibleColumns]}
                              onChange={(e) =>
                                updateVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))
                              }
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Select Button */}
            <button
              onClick={toggleSelectionMode}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium whitespace-nowrap',
                isSelectionMode
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {isSelectionMode ? (
                <>
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Select</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {isSelectionMode && selectedVehicleIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={handleSelectAll}
                className="text-sm font-medium text-blue-700 hover:text-blue-900"
              >
                {selectedVehicleIds.length === vehicles.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-sm text-blue-700">
                {selectedVehicleIds.length} vehicle{selectedVehicleIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Actions Dropdown */}
              <div className="relative" ref={bulkActionsMenuRef}>
                <button
                  onClick={() => setShowBulkActionsMenu(!showBulkActionsMenu)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showBulkActionsMenu && (
                  <div className="absolute top-full mt-2 left-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-[100] py-1">
                    <button
                      onClick={() => {
                        handleBulkShareReport();
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share Updated Report</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkDownload(true);
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download with repair costs</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkDownload(false);
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download without repair costs</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkOpen(true);
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open with repair costs</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkOpen(false);
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Open without repair costs</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkExportData();
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Export Data</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsBulkChaseUpModalOpen(true);
                        setShowBulkActionsMenu(false);
                      }}
                      disabled={!canChaseUpSelection()}
                      className={clsx(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                        canChaseUpSelection()
                          ? "text-gray-700 hover:bg-gray-50"
                          : "text-gray-400 cursor-not-allowed"
                      )}
                      title={!canChaseUpSelection() ? "Some selected vehicles are not eligible for chase up" : "Send bulk chase up"}
                    >
                      <Bell className="w-4 h-4" />
                      <span>Bulk Chase Up</span>
                    </button>

                    <div className="border-t border-gray-200 my-1"></div>

                    <button
                      onClick={() => {
                        handleBulkRequestBodyShopQuote();
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                      <span>Request a body shop quote</span>
                    </button>

                    <button
                      onClick={() => {
                        handleBulkSubmitBuybackRequest();
                        setShowBulkActionsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Submit a buyback request</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsBulkTagModalOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <TagIcon className="w-4 h-4" />
                <span>Apply Tag</span>
              </button>

              {filters.status === 'archived' || (filters.statusIds?.length === 1 && filters.statusIds[0] === 'archived') ? (
                <button
                  onClick={handleBulkUnarchive}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <ArchiveRestore className="w-4 h-4" />
                  <span>Unarchive</span>
                </button>
              ) : (
                <button
                  onClick={handleBulkArchive}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Vehicles Display */}
      {vehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600">No vehicles found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting your search criteria or filters
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-4">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => handleVehicleClick(vehicle)}
                onChaseUp={handleChaseUp}
                onShareReport={handleShareReport}
                onUnarchive={handleUnarchiveClick}
                isSelectionMode={isSelectionMode}
                isSelected={selectedVehicleIds.includes(vehicle.id)}
                onSelectToggle={handleSelectToggle}
                visibleFields={visibleCardFields}
              />
            ))}
          </div>

          {/* Sticky pagination footer for grid view */}
          {pagination.totalItems > 0 && (
            <div className="sticky bottom-0 z-[100] bg-white border-t border-gray-200 shadow-lg">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector={true}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            <div
              ref={tableScrollRef}
              className="overflow-x-auto scrollbar-hide"
            >
              <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isSelectionMode && (
                    <th className="px-6 py-3">
                      <input
                        type="checkbox"
                        checked={selectedVehicleIds.length === vehicles.length}
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                  )}
                  {columnOrder.map(columnId => {
                    if (!visibleColumns[columnId as keyof typeof visibleColumns]) return null;

                    const isCentered = ['carBody', 'rim', 'glass', 'interior', 'tires', 'dashboard', 'declarations'].includes(columnId);
                    return renderColumnHeader(columnId, isCentered ? 'center' : 'left');
                  })}
                  <th className="sticky right-0 z-30 bg-gray-50 w-16 border-l border-gray-200">
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <VehicleTableRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onClick={() => handleVehicleClick(vehicle)}
                    onShareReport={handleShareReport}
                    onChaseUp={handleChaseUpClick}
                    onUnarchive={handleUnarchiveClick}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedVehicleIds.includes(vehicle.id)}
                    onSelectToggle={handleSelectToggle}
                    columnOrder={columnOrder}
                    visibleColumns={visibleColumns}
                    isMenuOpen={openMenuVehicleId === vehicle.id}
                    onMenuToggle={(isOpen) => setOpenMenuVehicleId(isOpen ? vehicle.id : null)}
                  />
                ))}
              </tbody>
              </table>
            </div>
          </div>

          {/* Sticky horizontal scrollbar */}
          <div
            ref={scrollbarRef}
            className="sticky bottom-0 z-[50] overflow-x-auto bg-gray-50 border-t border-gray-200"
            style={{ height: '16px' }}
          >
            <div style={{ width: tableScrollRef.current?.scrollWidth || '100%', height: '1px' }} />
          </div>

          {/* Sticky pagination footer for table view */}
          {pagination.totalItems > 0 && (
            <div className="sticky bottom-0 z-[100] bg-white border-t border-gray-200 shadow-lg">
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                showPageSizeSelector={true}
                pageSizeOptions={[10, 20, 50, 100]}
              />
            </div>
          )}
        </div>
      )}

      <BulkChaseUpModal
        vehicleCount={selectedVehicleIds.length}
        isOpen={isBulkChaseUpModalOpen}
        onClose={() => setIsBulkChaseUpModalOpen(false)}
        onChaseUp={handleBulkChaseUp}
      />

      <BulkTagModal
        vehicleCount={selectedVehicleIds.length}
        isOpen={isBulkTagModalOpen}
        onClose={() => setIsBulkTagModalOpen(false)}
        onTagsApplied={handleBulkTagApplied}
      />

      {vehicleToShare && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setVehicleToShare(null);
          }}
          onShare={handleShareSubmit}
          onShareInternal={handleShareInternal}
          vehicleRegistration={vehicleToShare.registration}
          shareStatus={shareStatus}
        />
      )}

      {vehicleToChaseUp && (
        <ChaseUpModal
          vehicle={vehicleToChaseUp}
          isOpen={isChaseUpModalOpen}
          onClose={() => {
            setIsChaseUpModalOpen(false);
            setVehicleToChaseUp(null);
          }}
          onChaseUp={handleChaseUp}
        />
      )}
    </div>
  );
};