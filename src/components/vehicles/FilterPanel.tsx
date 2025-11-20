import React, { useState, useEffect, useRef } from 'react';
import { Filter, X, Calendar, Building2, Mail, Phone, FileCheck, Settings, DollarSign, Gauge, CheckCircle2, CircleDashed, Tag } from 'lucide-react';
import { SearchFilters, VehicleStatus, InspectionType, Company, FilterType, Tag as TagType } from '../../types';
import { tagService } from '../../services/tagService';
import clsx from 'clsx';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  companies: Company[];
  showCompanyFilter?: boolean;
  rightContent?: React.ReactNode;
}

const statusOptions: { value: VehicleStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'link_sent', label: 'Link Sent' },
  { value: 'chased_up_1', label: 'Chased-up (1st)' },
  { value: 'chased_up_2', label: 'Chased-up (2nd)' },
  { value: 'chased_up_manual', label: 'Chased-up (Manual)' },
  { value: 'inspection_in_progress', label: 'In Progress' },
  { value: 'inspected', label: 'Inspected' },
  { value: 'to_review', label: 'To Review' },
  { value: 'archived', label: 'Archived' }
];

const inspectionTypeOptions: { value: InspectionType | 'all'; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'api', label: 'API' },
  { value: 'manual_upload', label: 'Manual Upload' },
  { value: 'webapp', label: 'WebApp' }
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
  showCompanyFilter = false,
  rightContent
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['inspectionType', 'status']);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [showInspectionTypeDropdown, setShowInspectionTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [tempInspectionTypeIds, setTempInspectionTypeIds] = useState<InspectionType[]>([]);
  const [tempStatusIds, setTempStatusIds] = useState<VehicleStatus[]>([]);
  const inspectionTypeRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTags();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inspectionTypeRef.current && !inspectionTypeRef.current.contains(event.target as Node)) {
        if (showInspectionTypeDropdown) {
          // Apply changes when closing
          onFiltersChange({
            inspectionTypeIds: tempInspectionTypeIds.length > 0 ? tempInspectionTypeIds : undefined,
            inspectionType: tempInspectionTypeIds.length === 0 ? 'all' : filters.inspectionType
          });
          setShowInspectionTypeDropdown(false);
        }
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        if (showStatusDropdown) {
          // Apply changes when closing
          onFiltersChange({
            statusIds: tempStatusIds.length > 0 ? tempStatusIds : undefined,
            status: tempStatusIds.length === 0 ? 'all' : filters.status
          });
          setShowStatusDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInspectionTypeDropdown, showStatusDropdown, tempInspectionTypeIds, tempStatusIds, filters.inspectionType, filters.status, onFiltersChange]);

  const loadTags = async () => {
    try {
      const tags = await tagService.getAllTags();
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  useEffect(() => {
    setActiveFilters(prev => {
      const newFilters = [...prev];
      let changed = false;

      // Always ensure inspectionType and status are in the list
      if (!newFilters.includes('inspectionType')) {
        newFilters.unshift('inspectionType');
        changed = true;
      }
      if (!newFilters.includes('status')) {
        const typeIndex = newFilters.indexOf('inspectionType');
        newFilters.splice(typeIndex + 1, 0, 'status');
        changed = true;
      }

      if ((filters.mileageRange?.min !== undefined || filters.mileageRange?.max !== undefined) && !newFilters.includes('mileage')) {
        newFilters.push('mileage');
        changed = true;
      }

      if ((filters.repairCostRange?.min !== undefined || filters.repairCostRange?.max !== undefined) && !newFilters.includes('repairCost')) {
        newFilters.push('repairCost');
        changed = true;
      }

      if ((filters.dateRange?.start || filters.dateRange?.end) && !newFilters.includes('dateRange')) {
        newFilters.push('dateRange');
        changed = true;
      }

      if (filters.companyId && filters.companyId !== 'all' && !newFilters.includes('company')) {
        newFilters.push('company');
        changed = true;
      }

      if (filters.customerEmail && !newFilters.includes('customerEmail')) {
        newFilters.push('customerEmail');
        changed = true;
      }

      if (filters.customerPhone && !newFilters.includes('customerPhone')) {
        newFilters.push('customerPhone');
        changed = true;
      }

      return changed ? newFilters : prev;
    });
  }, [filters]);

  const hasRepairCostFilter = filters.repairCostRange?.min !== undefined || filters.repairCostRange?.max !== undefined;
  const hasMileageFilter = filters.mileageRange?.min !== undefined || filters.mileageRange?.max !== undefined;
  const hasDateRangeFilter = filters.dateRange?.start || filters.dateRange?.end;

  const hasActiveFilters =
    filters.status !== 'all' ||
    (filters.statusIds && filters.statusIds.length > 0) ||
    filters.companyId !== 'all' ||
    filters.inspectionType !== 'all' ||
    (filters.inspectionTypeIds && filters.inspectionTypeIds.length > 0) ||
    (filters.tagIds && filters.tagIds.length > 0) ||
    hasDateRangeFilter ||
    hasRepairCostFilter ||
    hasMileageFilter ||
    filters.userId !== 'all' ||
    filters.customerEmail ||
    filters.customerPhone;

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      statusIds: undefined,
      companyId: 'all',
      inspectionType: 'all',
      inspectionTypeIds: undefined,
      tagIds: undefined,
      dateRange: undefined,
      repairCostRange: undefined,
      mileageRange: undefined,
      userId: 'all',
      customerEmail: '',
      customerPhone: ''
    });
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const renderFilter = (filterId: string) => {
    switch (filterId) {
      case 'inspectionType':
        return (
          <div key={filterId} className="w-full" ref={inspectionTypeRef}>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-gray-500" />
              Inspection Type
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showInspectionTypeDropdown) {
                    setTempInspectionTypeIds(filters.inspectionTypeIds || []);
                  }
                  setShowInspectionTypeDropdown(!showInspectionTypeDropdown);
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm min-h-[34px] flex items-center hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                  {filters.inspectionTypeIds && filters.inspectionTypeIds.length > 0 ? (
                    filters.inspectionTypeIds.map(typeId => {
                      const option = inspectionTypeOptions.find(opt => opt.value === typeId);
                      return option ? (
                        <span key={typeId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {option.label}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500">All Types</span>
                  )}
                </div>
              </button>
              {showInspectionTypeDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
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
          <div key={filterId} className="w-full" ref={statusRef}>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-gray-500" />
              Status
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!showStatusDropdown) {
                    setTempStatusIds(filters.statusIds || []);
                  }
                  setShowStatusDropdown(!showStatusDropdown);
                }}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md bg-white text-sm min-h-[34px] flex items-center hover:border-gray-400 transition-colors"
              >
                <div className="flex flex-wrap gap-1 flex-1 text-left">
                  {filters.statusIds && filters.statusIds.length > 0 ? (
                    filters.statusIds.map(statusId => {
                      const option = statusOptions.find(opt => opt.value === statusId);
                      return option ? (
                        <span key={statusId} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                          {option.label}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-gray-500">All Status</span>
                  )}
                </div>
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
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
          <div key={filterId} className="w-full col-span-full">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-gray-500" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableTags.map(tag => {
                const isSelected = filters.tagIds?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => {
                      const currentTags = filters.tagIds || [];
                      const newTags = isSelected
                        ? currentTags.filter(id => id !== tag.id)
                        : [...currentTags, tag.id];
                      onFiltersChange({ tagIds: newTags.length > 0 ? newTags : undefined });
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
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              Date Range
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => onFiltersChange({
                  dateRange: {
                    start: e.target.value,
                    end: filters.dateRange?.end || ''
                  }
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => onFiltersChange({
                  dateRange: {
                    start: filters.dateRange?.start || '',
                    end: e.target.value
                  }
                })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'company':
        if (!showCompanyFilter) return null;
        return (
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Company
            </label>
            <select
              value={filters.companyId}
              onChange={(e) => onFiltersChange({ companyId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
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
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Customer Email
            </label>
            <input
              type="email"
              placeholder="customer@example.com"
              value={filters.customerEmail || ''}
              onChange={(e) => onFiltersChange({ customerEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'customerPhone':
        return (
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Customer Phone
            </label>
            <input
              type="tel"
              placeholder="+1234567890"
              value={filters.customerPhone || ''}
              onChange={(e) => onFiltersChange({ customerPhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );

      case 'repairCost':
        return (
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              Repair Cost Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={filters.repairCostRange?.min ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  onFiltersChange({
                    repairCostRange: {
                      min: numValue,
                      max: filters.repairCostRange?.max
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={filters.repairCostRange?.max ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  onFiltersChange({
                    repairCostRange: {
                      min: filters.repairCostRange?.min,
                      max: numValue
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      case 'mileage':
        return (
          <div key={filterId} className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-gray-400" />
              Mileage Range (km)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Min"
                value={filters.mileageRange?.min ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  onFiltersChange({
                    mileageRange: {
                      min: numValue,
                      max: filters.mileageRange?.max
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Max"
                value={filters.mileageRange?.max ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = value === '' ? undefined : Math.max(0, Number(value));
                  onFiltersChange({
                    mileageRange: {
                      min: filters.mileageRange?.min,
                      max: numValue
                    }
                  });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="px-4 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                  Active
                </span>
              )}
            </button>

            {isExpanded && (
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configure</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Clear all</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {rightContent}
          </div>
        </div>

        {isExpanded && isConfiguring && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Select filters to display:</p>
            <div className="flex flex-wrap gap-2">
              {availableFilters.map((filter) => {
                const Icon = filter.icon;
                const isActive = activeFilters.includes(filter.id);
                const isDisabled = filter.id === 'company' && !showCompanyFilter;

                if (isDisabled) return null;

                return (
                  <button
                    key={filter.id}
                    onClick={() => toggleFilter(filter.id)}
                    className={clsx(
                      'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm',
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {isExpanded && !isConfiguring && (
          <div className="pt-3 border-t border-gray-200">
            {/* All active filters */}
            {activeFilters.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 bg-gradient-to-r from-blue-50 to-gray-50 p-3 rounded-lg border border-blue-100">
                {activeFilters.map(filterId => renderFilter(filterId))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
