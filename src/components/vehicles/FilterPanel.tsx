import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Filter, X, Calendar, Building2, Mail, Phone, FileCheck, DollarSign, Gauge, CheckCircle2, CircleDashed, Tag } from 'lucide-react';
import { SearchFilters, VehicleStatus, InspectionType, Company, Tag as TagType } from '../../types';
import { tagService } from '../../services/tagService';
import clsx from 'clsx';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  companies: Company[];
  showCompanyFilter?: boolean;
}

const statusOptions: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'link_sent', label: 'Created' },
  { value: 'chased_up', label: 'ChaseUp' },
  { value: 'inspection_in_progress', label: 'In Progress' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'to_review', label: 'To Review' },
  { value: 'archived', label: 'Archived' }
];

const inspectionTypeOptions: { value: InspectionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'api', label: 'API' },
  { value: 'manual_upload', label: 'Manual Upload' },
  { value: 'remote_inspection', label: 'Remote Inspection' },
  { value: 'onsite_inspection', label: 'On-site Inspection' }
];

const availableFilters: { id: string; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'inspectionType', label: 'Inspection Type', icon: FileCheck },
  { id: 'status', label: 'Status', icon: CheckCircle2 },
  { id: 'tags', label: 'Tags', icon: Tag },
  { id: 'dateRange', label: 'Date Range', icon: Calendar },
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'repairCost', label: 'Repair Cost', icon: DollarSign },
  { id: 'mileage', label: 'Mileage', icon: Gauge },
  { id: 'customerEmail', label: 'Customer Email', icon: Mail },
  { id: 'customerPhone', label: 'Customer Phone', icon: Phone }
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  companies,
  showCompanyFilter = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const filterButtonRef = useRef<HTMLDivElement>(null);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [showInspectionTypeDropdown, setShowInspectionTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [tempInspectionTypeIds, setTempInspectionTypeIds] = useState<InspectionType[]>([]);
  const [tempStatusIds, setTempStatusIds] = useState<VehicleStatus[]>([]);
  const inspectionTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Local filter state (pending changes)
  const [pendingFilters, setPendingFilters] = useState<SearchFilters>(() => filters);

  // Sync pending filters with actual filters when they change (e.g., tab switching)
  useLayoutEffect(() => {
    setPendingFilters(filters);
    setIsExpanded(false);
  }, [filters]);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target as Node)) {
        if (isExpanded) {
          setIsExpanded(false);
        }
      }
      if (inspectionTypeRef.current && !inspectionTypeRef.current.contains(event.target as Node)) {
        if (showInspectionTypeDropdown) {
          updatePendingFilters({
            inspectionTypeIds: tempInspectionTypeIds.length > 0 ? tempInspectionTypeIds : undefined,
            inspectionType: tempInspectionTypeIds.length === 0 ? 'all' : pendingFilters.inspectionType
          });
          setShowInspectionTypeDropdown(false);
        }
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        if (showStatusDropdown) {
          updatePendingFilters({
            statusIds: tempStatusIds.length > 0 ? tempStatusIds : undefined,
            status: tempStatusIds.length === 0 ? 'all' : pendingFilters.status
          });
          setShowStatusDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, showInspectionTypeDropdown, showStatusDropdown, tempInspectionTypeIds, tempStatusIds, pendingFilters.inspectionType, pendingFilters.status]);

  const loadTags = async () => {
    try {
      const tags = await tagService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };


  const hasRepairCostFilter = pendingFilters.repairCostRange?.min !== undefined || pendingFilters.repairCostRange?.max !== undefined;
  const hasMileageFilter = pendingFilters.mileageRange?.min !== undefined || pendingFilters.mileageRange?.max !== undefined;
  const hasDateRangeFilter = pendingFilters.dateRange?.start || pendingFilters.dateRange?.end;

  const hasActiveFilters =
    filters.status !== 'all' ||
    (filters.statusIds && filters.statusIds.length > 0) ||
    filters.companyId !== 'all' ||
    filters.inspectionType !== 'all' ||
    (filters.inspectionTypeIds && filters.inspectionTypeIds.length > 0) ||
    (filters.tagIds && filters.tagIds.length > 0) ||
    (filters.dateRange?.start || filters.dateRange?.end) ||
    (filters.repairCostRange?.min !== undefined || filters.repairCostRange?.max !== undefined) ||
    (filters.mileageRange?.min !== undefined || filters.mileageRange?.max !== undefined) ||
    filters.userId !== 'all' ||
    filters.customerEmail ||
    filters.customerPhone;

  // Compare filters excluding query field (search is handled separately)
  const hasPendingChanges = (() => {
    // Create copies without the query field for comparison
    const { query: _, ...currentFilters } = filters;
    const { query: __, ...pending } = pendingFilters;
    return JSON.stringify(currentFilters) !== JSON.stringify(pending);
  })();

  const updatePendingFilters = (updates: Partial<SearchFilters>) => {
    setPendingFilters(prev => ({ ...prev, ...updates }));
  };

  const applyFilters = () => {
    // Only send filter changes, not the query field
    const { query, ...filterUpdates } = pendingFilters;
    onFiltersChange(filterUpdates);
    setIsExpanded(false);
  };

  const resetFilters = () => {
    setPendingFilters(filters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      status: 'all' as const,
      statusIds: undefined,
      companyId: 'all',
      inspectionType: 'all' as const,
      inspectionTypeIds: undefined,
      tagIds: undefined,
      dateRange: undefined,
      repairCostRange: undefined,
      mileageRange: undefined,
      userId: 'all',
      customerEmail: '',
      customerPhone: ''
    };
    setPendingFilters(prev => ({ ...prev, ...clearedFilters }));
  };


  const renderFilter = (filterId: string) => {
    switch (filterId) {
      case 'inspectionType':
        return (
          <div key={filterId} ref={inspectionTypeRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-gray-500" />
              Inspection Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showInspectionTypeDropdown) {
                    setTempInspectionTypeIds(pendingFilters.inspectionTypeIds || []);
                  }
                  setShowInspectionTypeDropdown(!showInspectionTypeDropdown);
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm min-h-[34px] flex items-center hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                  {pendingFilters.inspectionTypeIds && pendingFilters.inspectionTypeIds.length > 0 ? (
                    pendingFilters.inspectionTypeIds.map(typeId => {
                      const option = inspectionTypeOptions.find(opt => opt.value === typeId);
                      return option ? (
                        <span
                          key={typeId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTypes = pendingFilters.inspectionTypeIds?.filter(t => t !== typeId) || [];
                            setTempInspectionTypeIds(newTypes);
                            updatePendingFilters({
                              inspectionTypeIds: newTypes.length > 0 ? newTypes : undefined,
                              inspectionType: newTypes.length === 0 ? 'all' : pendingFilters.inspectionType
                            });
                          }}
                        >
                          {option.label}
                          <X className="w-3 h-3" />
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500">All Types</span>
                  )}
                </div>
              </button>
              {showInspectionTypeDropdown && inspectionTypeRef.current && (
                <div
                  className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[60] max-h-64 overflow-y-auto"
                  style={{
                    top: `${inspectionTypeRef.current.getBoundingClientRect().bottom + 4}px`,
                    left: `${inspectionTypeRef.current.getBoundingClientRect().left}px`,
                    width: `${inspectionTypeRef.current.getBoundingClientRect().width}px`,
                  }}
                >
                  {inspectionTypeOptions.filter(opt => opt.value !== 'all').map(option => {
                    const isSelected = tempInspectionTypeIds.includes(option.value as InspectionType);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newTypes = isSelected
                              ? tempInspectionTypeIds.filter(t => t !== option.value)
                              : [...tempInspectionTypeIds, option.value as InspectionType];
                            setTempInspectionTypeIds(newTypes);
                            // Update pending filters immediately
                            updatePendingFilters({
                              inspectionTypeIds: newTypes.length > 0 ? newTypes : undefined,
                              inspectionType: newTypes.length === 0 ? 'all' : pendingFilters.inspectionType
                            });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'status':
        return (
          <div key={filterId} ref={statusRef}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-gray-500" />
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showStatusDropdown) {
                    setTempStatusIds(pendingFilters.statusIds || []);
                  }
                  setShowStatusDropdown(!showStatusDropdown);
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm min-h-[34px] flex items-center hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                  {pendingFilters.statusIds && pendingFilters.statusIds.length > 0 ? (
                    pendingFilters.statusIds.map(statusId => {
                      const option = statusOptions.find(opt => opt.value === statusId);
                      return option ? (
                        <span
                          key={statusId}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded cursor-pointer hover:bg-blue-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newStatuses = pendingFilters.statusIds?.filter(s => s !== statusId) || [];
                            setTempStatusIds(newStatuses);
                            updatePendingFilters({
                              statusIds: newStatuses.length > 0 ? newStatuses : undefined,
                              status: newStatuses.length === 0 ? 'all' : pendingFilters.status
                            });
                          }}
                        >
                          {option.label}
                          <X className="w-3 h-3" />
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500">All Status</span>
                  )}
                </div>
              </button>
              {showStatusDropdown && statusRef.current && (
                <div
                  className="fixed bg-white border border-gray-300 rounded-md shadow-lg z-[60] max-h-64 overflow-y-auto"
                  style={{
                    top: `${statusRef.current.getBoundingClientRect().bottom + 4}px`,
                    left: `${statusRef.current.getBoundingClientRect().left}px`,
                    width: `${statusRef.current.getBoundingClientRect().width}px`,
                  }}
                >
                  {statusOptions.filter(opt => opt.value !== 'all').map(option => {
                    const isSelected = tempStatusIds.includes(option.value as VehicleStatus);
                    return (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            const newStatuses = isSelected
                              ? tempStatusIds.filter(s => s !== option.value)
                              : [...tempStatusIds, option.value as VehicleStatus];
                            setTempStatusIds(newStatuses);
                            // Update pending filters immediately
                            updatePendingFilters({
                              statusIds: newStatuses.length > 0 ? newStatuses : undefined,
                              status: newStatuses.length === 0 ? 'all' : pendingFilters.status
                            });
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'tags':
        return (
          <div key={filterId} className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gray-500" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSelected = filters.tagIds?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      const currentTags = pendingFilters.tagIds || [];
                      const newTags = isSelected
                        ? currentTags.filter(id => id !== tag.id)
                        : [...currentTags, tag.id];
                      updatePendingFilters({ tagIds: newTags.length > 0 ? newTags : undefined });
                    }}
                    className={clsx(
                      'px-2 py-1 rounded-full text-xs font-medium transition-all',
                      isSelected
                        ? 'text-white ring-2 ring-offset-1 ring-gray-400'
                        : 'text-white opacity-60 hover:opacity-100'
                    )}
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </button>
                );
              })}
              {availableTags.length === 0 && (
                <span className="text-xs text-gray-500">No tags available</span>
              )}
            </div>
          </div>
        );

      case 'dateRange':
        return (
          <div key={filterId} className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={pendingFilters.dateRange?.start || ''}
                onChange={(e) => updatePendingFilters({
                  dateRange: {
                    start: e.target.value,
                    end: pendingFilters.dateRange?.end || ''
                  }
                })}
                className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={pendingFilters.dateRange?.end || ''}
                onChange={(e) => updatePendingFilters({
                  dateRange: {
                    start: pendingFilters.dateRange?.start || '',
                    end: e.target.value
                  }
                })}
                className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'company':
        if (!showCompanyFilter) return null;
        return (
          <div key={filterId}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Company
            </label>
            <select
              value={pendingFilters.companyId}
              onChange={(e) => updatePendingFilters({ companyId: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="all">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
        );

      case 'customerEmail':
        return (
          <div key={filterId} className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Customer Email
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              value={pendingFilters.customerEmail || ''}
              onChange={(e) => updatePendingFilters({ customerEmail: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
        );

      case 'customerPhone':
        return (
          <div key={filterId} className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Customer Phone
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={pendingFilters.customerPhone || ''}
              onChange={(e) => updatePendingFilters({ customerPhone: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>
        );

      case 'repairCost':
        return (
          <div key={filterId} className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              Repair Cost Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={pendingFilters.repairCostRange?.min ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  updatePendingFilters({
                    repairCostRange: {
                      min: numValue,
                      max: pendingFilters.repairCostRange?.max
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={pendingFilters.repairCostRange?.max ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  updatePendingFilters({
                    repairCostRange: {
                      min: pendingFilters.repairCostRange?.min,
                      max: numValue
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          </div>
        );

      case 'mileage':
        return (
          <div key={filterId} className="sm:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-400" />
              Mileage Range (km)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={pendingFilters.mileageRange?.min ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  updatePendingFilters({
                    mileageRange: {
                      min: numValue,
                      max: pendingFilters.mileageRange?.max
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={pendingFilters.mileageRange?.max ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  updatePendingFilters({
                    mileageRange: {
                      min: pendingFilters.mileageRange?.min,
                      max: numValue
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative" ref={filterButtonRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm font-medium relative",
          hasActiveFilters
            ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        )}
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filters</span>
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {[
              filters.status !== 'all' || (filters.statusIds && filters.statusIds.length > 0),
              filters.inspectionType !== 'all' || (filters.inspectionTypeIds && filters.inspectionTypeIds.length > 0),
              filters.tagIds && filters.tagIds.length > 0,
              hasDateRangeFilter,
              hasRepairCostFilter,
              hasMileageFilter,
              filters.companyId !== 'all',
              filters.customerEmail,
              filters.customerPhone
            ].filter(Boolean).length}
          </span>
        )}
      </button>

      {/* Filter Dropdown */}
      {isExpanded && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsExpanded(false)}
          />
          <div
            className="fixed md:w-[900px] w-full left-0 md:left-auto md:right-6 bg-white md:rounded-lg shadow-xl border-t md:border border-gray-200 z-50 bottom-0 md:bottom-auto max-h-[85vh] md:max-h-none overflow-y-auto"
            style={{
              top: filterButtonRef.current && window.innerWidth >= 768 ? `${filterButtonRef.current.getBoundingClientRect().bottom + 8}px` : undefined,
            }}
          >
            <div className="p-4 sm:p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-gray-900">Filter Vehicles</h3>
                  {(hasPendingChanges || hasActiveFilters) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>


              {/* Filter Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-h-[520px] overflow-y-auto pr-2">
                {availableFilters
                  .filter(filter => !(filter.id === 'company' && !showCompanyFilter))
                  .map(filter => renderFilter(filter.id))}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <button
                  onClick={resetFilters}
                  disabled={!hasPendingChanges}
                  className={clsx(
                    "px-4 py-3 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    hasPendingChanges
                      ? "text-gray-700 hover:bg-gray-100"
                      : "text-gray-400 cursor-not-allowed"
                  )}
                  title="Discard changes and revert to applied filters"
                >
                  Discard Changes
                </button>
                <button
                  onClick={applyFilters}
                  disabled={!hasPendingChanges}
                  className={clsx(
                    "px-6 py-3 sm:py-2 text-sm font-medium rounded-lg transition-colors",
                    hasPendingChanges
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  )}
                  title="Apply filters and reload vehicle list"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
