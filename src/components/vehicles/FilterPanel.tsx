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

  useEffect(() => {
    loadTags();
  }, []);

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
    filters.companyId !== 'all' ||
    filters.inspectionType !== 'all' ||
    hasDateRangeFilter ||
    hasRepairCostFilter ||
    hasMileageFilter ||
    filters.userId !== 'all' ||
    filters.customerEmail ||
    filters.customerPhone;

  const clearAllFilters = () => {
    onFiltersChange({
      status: 'all',
      companyId: 'all',
      inspectionType: 'all',
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
          <div key={filterId} className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-gray-500" />
              Inspection Type
            </label>
            <select
              value={filters.inspectionType || 'all'}
              onChange={(e) => onFiltersChange({ inspectionType: e.target.value as InspectionType | 'all' })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
            >
              {inspectionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'status':
        return (
          <div key={filterId} className="flex-1 min-w-[180px]">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-gray-500" />
              Status
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => onFiltersChange({ status: e.target.value as VehicleStatus | 'all' })}
              className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'tags':
        return (
          <div key={filterId} className="flex-1 min-w-[200px]">
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
          <div key={filterId}>
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
          <div key={filterId}>
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
          <div key={filterId}>
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
          <div key={filterId}>
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
          <div key={filterId}>
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
          <div key={filterId}>
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
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
                <span>Configure</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
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
              <div className="flex gap-3 flex-wrap bg-gradient-to-r from-blue-50 to-gray-50 p-3 rounded-lg border border-blue-100">
                {activeFilters.map(filterId => renderFilter(filterId))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
