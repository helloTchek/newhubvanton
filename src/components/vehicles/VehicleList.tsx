import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Grid2x2 as Grid, List, Plus, CheckSquare, X, Bell, Archive, ArrowUpDown, Columns3, ArrowUp, ArrowDown, GripVertical, Tag as TagIcon } from 'lucide-react';
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
import { BulkTagModal } from './BulkTagModal';
import { ShareReportModal } from './ShareReportModal';
import { shareService } from '../../services/shareService';
import { tagService } from '../../services/tagService';
import { userPreferencesService } from '../../services/userPreferencesService';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const statusOptions: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'inspection_in_progress', label: 'In Progress' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'to_review', label: 'To Review' }
];

export const VehicleList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true, error: null });
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
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
  const [isBulkTagModalOpen, setIsBulkTagModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    registration: true,
    vin: true,
    makeModel: true,
    company: true,
    status: true,
    inspectionDate: true,
    inspectionId: true,
    mileage: true,
    value: true,
    tags: true,
    carBody: true,
    rim: true,
    glass: true,
    interior: true,
    tires: true,
    dashboard: true,
    declarations: true
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [visibleCardFields, setVisibleCardFields] = useState({
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
    repairCost: true,
    value: true,
    damageResults: true,
    tags: true
  });
  const [showCardFieldSelector, setShowCardFieldSelector] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [vehicleToShare, setVehicleToShare] = useState<Vehicle | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'image', 'registration', 'vin', 'makeModel', 'company', 'status', 'inspectionDate', 'inspectionId',
    'mileage', 'value', 'tags', 'carBody', 'rim', 'glass',
    'interior', 'tires', 'dashboard', 'declarations'
  ]);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: 'all',
    companyId: user?.companyId || 'all',
    inspectionType: 'all',
    dateRange: undefined,
    userId: 'all',
    customerEmail: '',
    customerPhone: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    pageSize: 20
  });

  const loadVehicles = useCallback(async () => {
    try {
      console.log('VehicleList loadVehicles called with filters:', filters);
      setLoading({ isLoading: true, error: null });
      const response = await vehicleService.getVehicles(filters);
      console.log('VehicleList received response:', { vehicleCount: response.data.length, pagination: response.pagination });
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
  }, [filters]);

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
        setFilters(prev => ({ ...prev, ...preferences.filters }));
        setColumnOrder(preferences.columnOrder);
        setVisibleColumns(preferences.visibleColumns);
        setVisibleCardFields(preferences.visibleCardFields);
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

  useEffect(() => {
    if (!preferencesLoaded) return;

    const debounceTimer = setTimeout(() => {
      loadVehicles();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [filters, loadVehicles, preferencesLoaded]);

  useEffect(() => {
    if (!preferencesLoaded) return;

    const saveTimer = setTimeout(() => {
      saveUserPreferences();
    }, 500);

    return () => clearTimeout(saveTimer);
  }, [viewMode, filters, columnOrder, visibleColumns, visibleCardFields, saveUserPreferences, preferencesLoaded]);

  const handleVehicleClick = (vehicle: Vehicle) => {
    navigate(`/vehicles/${vehicle.id}/report`);
  };

  const handleChaseUp = async (vehicleId: string, method: 'email' | 'sms') => {
    try {
      await chaseUpService.sendChaseUp(vehicleId, method);
      toast.success(`Chase up ${method} sent successfully`);
      await loadVehicles();
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to send chase up');
      throw error;
    }
  };

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters(prev => ({ ...prev, pageSize, page: 1 }));
  };

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
      await loadVehicles();
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
      toast.success(`${selectedVehicleIds.length} vehicles archived successfully`);
      setSelectedVehicleIds([]);
      setIsSelectionMode(false);
      await loadVehicles();
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to archive vehicles');
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
      await loadVehicles();
    } catch (error: unknown) {
      toast.error(error.message || 'Failed to apply tag');
      throw error;
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
    setColumnOrder(newOrder);
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

  const handleShareReport = (vehicle: Vehicle) => {
    if (!vehicle.reportId) {
      toast.error('No report available to share');
      return;
    }
    setVehicleToShare(vehicle);
    setIsShareModalOpen(true);
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
      await loadVehicles();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report';
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
      'status': 'Status',
      'inspectionDate': 'Inspection Date',
      'inspectionId': 'Inspection ID',
      'mileage': 'Mileage',
      'value': 'Value',
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
      ['link_sent', 'chased_up_1', 'chased_up_2', 'inspection_in_progress'].includes(v.status)
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
    <div className="p-6 space-y-6">
      {/* Unified Search, Sort & Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Top Row: Search, Sort, View Toggle, Select */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
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

            {/* Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilters({ sortBy: e.target.value as SortField })}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[140px]"
              >
                <option value="date">Date (newest)</option>
                <option value="registration">Registration</option>
                <option value="make">Make & Model</option>
                <option value="value">Est. Value</option>
                <option value="repairCost">Repair Cost</option>
                <option value="mileage">Mileage</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => updateFilters({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title={filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
              >
                {filters.sortOrder === 'desc' ? '↓' : '↑'}
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">View:</span>
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
            </div>

            {/* Field/Column Selector */}
            <div className="relative">
              <button
                onClick={() => viewMode === 'grid' ? setShowCardFieldSelector(!showCardFieldSelector) : setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
              >
                <Columns3 className="w-4 h-4" />
                <span>{viewMode === 'grid' ? 'Fields' : 'Columns'}</span>
              </button>

              {viewMode === 'grid' && showCardFieldSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCardFieldSelector(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
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
                                setVisibleCardFields(prev => ({ ...prev, [key]: e.target.checked }))
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
                    className="fixed inset-0 z-10"
                    onClick={() => setShowColumnSelector(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-3">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-2">Visible Columns</p>
                      <div className="space-y-2">
                        {Object.entries({
                          image: 'Image',
                          registration: 'License Plate',
                          vin: 'VIN Number',
                          makeModel: 'Brand & Model',
                          company: 'Company',
                          status: 'Status',
                          inspectionDate: 'Inspection Date',
                          inspectionId: 'Inspection ID',
                          mileage: 'Mileage',
                          value: 'Value',
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
                                setVisibleColumns(prev => ({ ...prev, [key]: e.target.checked }))
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
          </div>
        </div>

        {/* Filters Section */}
        <FilterPanel
          filters={filters}
          onFiltersChange={updateFilters}
          companies={companies}
          showCompanyFilter={user?.companyId === 'all'}
          rightContent={
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
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4" />
                  <span>Select</span>
                </>
              )}
            </button>
          }
        />
      </div>

      {/* Bulk Actions Toolbar */}
      {isSelectionMode && selectedVehicleIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkTagModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <TagIcon className="w-4 h-4" />
                <span>Apply Tag</span>
              </button>

              <button
                onClick={() => setIsBulkChaseUpModalOpen(true)}
                disabled={!canChaseUpSelection()}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium",
                  canChaseUpSelection()
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                )}
                title={!canChaseUpSelection() ? "Some selected vehicles are not eligible for chase up" : "Send bulk chase up"}
              >
                <Bell className="w-4 h-4" />
                <span>Bulk Chase Up</span>
              </button>

              <button
                onClick={handleBulkArchive}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <Archive className="w-4 h-4" />
                <span>Archive</span>
              </button>
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
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onClick={() => handleVehicleClick(vehicle)}
                onChaseUp={handleChaseUp}
                onShareReport={handleShareReport}
                isSelectionMode={isSelectionMode}
                isSelected={selectedVehicleIds.includes(vehicle.id)}
                onSelectToggle={handleSelectToggle}
                visibleFields={visibleCardFields}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                    Actions
                  </th>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {vehicles.map((vehicle) => (
                  <VehicleTableRow
                    key={vehicle.id}
                    vehicle={vehicle}
                    onClick={() => handleVehicleClick(vehicle)}
                    onShareReport={handleShareReport}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedVehicleIds.includes(vehicle.id)}
                    onSelectToggle={handleSelectToggle}
                    columnOrder={columnOrder}
                    visibleColumns={visibleColumns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.totalItems > 0 && (
        <Pagination
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showPageSizeSelector={true}
          pageSizeOptions={[10, 20, 50, 100]}
        />
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
          vehicleRegistration={vehicleToShare.registration}
        />
      )}
    </div>
  );
};