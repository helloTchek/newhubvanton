import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bell, CheckCircle, AlertCircle, Download, Share2, FileSpreadsheet, MoreVertical, CarFront, Disc, AlertTriangle, FileText, ScrollText, ExternalLink } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { TagManager } from './TagManager';
import { getVehicleStatusInfo, getBadgeColorClasses } from '../../utils/vehicleStatus';
import clsx from 'clsx';

const WindshieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 8 L4 10 C4 12 5 14 7 15 L17 15 C19 14 20 12 20 10 L20 8 Z" />
    <path d="M4 8 L6 6 L18 6 L20 8" />
    <path d="M12 6 L12 15" />
  </svg>
);

const CarSeatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19 L7 14 C7 12 8 10 10 10 L14 10 C16 10 17 12 17 14 L17 19" />
    <path d="M7 19 L4 19 L4 14 L7 14" />
    <path d="M17 19 L20 19 L20 14 L17 14" />
    <path d="M10 10 L10 6 C10 5 11 4 12 4 C13 4 14 5 14 6 L14 10" />
  </svg>
);

interface VehicleTableRowProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onShareReport?: (vehicle: Vehicle) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (vehicleId: string) => void;
  columnOrder?: string[];
  visibleColumns?: {
    vehicle: boolean;
    company: boolean;
    status: boolean;
    inspectionDate: boolean;
    inspectionId: boolean;
    mileage: boolean;
    value: boolean;
    tags: boolean;
    carBody: boolean;
    rim: boolean;
    glass: boolean;
    interior: boolean;
    tires: boolean;
    dashboard: boolean;
    declarations: boolean;
  };
}

const statusesWithoutImages: VehicleStatus[] = [
  'link_sent',
  'chased_up_1',
  'chased_up_2',
  'inspection_in_progress'
];

export const VehicleTableRow: React.FC<VehicleTableRowProps> = ({
  vehicle,
  onClick,
  onShareReport,
  isSelectionMode = false,
  isSelected = false,
  onSelectToggle,
  columnOrder = [
    'vehicle', 'company', 'status', 'inspectionDate', 'inspectionId',
    'mileage', 'value', 'tags', 'carBody', 'rim', 'glass',
    'interior', 'tires', 'dashboard', 'declarations'
  ],
  visibleColumns = {
    vehicle: true,
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
  }
}) => {
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not inspected';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const shouldShowImage = !statusesWithoutImages.includes(vehicle.status);

  const statusInfo = getVehicleStatusInfo(
    vehicle.status,
    vehicle.isFastTrackDisabled || false,
    vehicle.manualReviewCompleted || false
  );

  const handleRowClick = () => {
    if (isSelectionMode && onSelectToggle) {
      onSelectToggle(vehicle.id);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectToggle) {
      onSelectToggle(vehicle.id);
    }
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsMenu(!showActionsMenu);
  };

  const handleDownloadReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Download report for vehicle:', vehicle.id);
    setShowActionsMenu(false);
  };

  const handleShareReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareReport) {
      onShareReport(vehicle);
    }
    setShowActionsMenu(false);
  };

  const handleExportData = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Export data for vehicle:', vehicle.id);
    setShowActionsMenu(false);
  };

  const handleOpenUrlReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    const reportUrl = `/vehicle/${vehicle.id}/report`;
    window.open(reportUrl, '_blank');
    setShowActionsMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setShowActionsMenu(false);
      }
    };

    if (showActionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionsMenu]);

  const renderCell = (columnId: string) => {
    if (!visibleColumns[columnId as keyof typeof visibleColumns]) return null;

    switch (columnId) {
      case 'vehicle':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              {shouldShowImage ? (
                <img
                  className="h-12 w-20 rounded-lg object-cover"
                  src={vehicle.imageUrl}
                  alt={`${vehicle.make} ${vehicle.model}`}
                />
              ) : (
                <div className="h-12 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {vehicle.make} {vehicle.model}
                </div>
                <div className="text-sm text-gray-500">
                  {vehicle.registration} • {vehicle.year}
                </div>
              </div>
            </div>
          </td>
        );

      case 'company':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{vehicle.companyName}</div>
            <div className="text-sm text-gray-500">{vehicle.customerEmail}</div>
          </td>
        );

      case 'status':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col gap-1">
              <StatusBadge status={vehicle.status} />
              {statusInfo.badge && (
                <div className={clsx(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                  getBadgeColorClasses(statusInfo.badge.color)
                )}>
                  {statusInfo.badge.color === 'green' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {statusInfo.badge.text}
                </div>
              )}
              {vehicle.sharedReport && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                  <Share2 className="w-3 h-3" />
                  <span>Shared</span>
                </div>
              )}
            </div>
          </td>
        );

      case 'inspectionDate':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {formatDate(vehicle.inspectionDate)}
          </td>
        );

      case 'inspectionId':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {vehicle.reportId ? (
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{vehicle.reportId}</span>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </td>
        );

      case 'mileage':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {vehicle.mileage.toLocaleString()} km
          </td>
        );

      case 'value':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {formatCurrency(vehicle.estimatedValue)}
            </div>
            {vehicle.estimatedCost > 0 && (
              <div className="text-sm text-red-600">
                Cost: {formatCurrency(vehicle.estimatedCost)}
              </div>
            )}
          </td>
        );

      case 'tags':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              {vehicle.tags && vehicle.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {vehicle.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              <TagManager
                vehicleId={vehicle.id}
                currentTags={vehicle.tags || []}
                onTagsUpdated={() => window.location.reload()}
              />
            </div>
          </td>
        );

      case 'carBody':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <CarFront className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.carBody}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'rim':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.rims}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'glass':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <WindshieldIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.glazing}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'interior':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <CarSeatIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.interior}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'tires':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.tires}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'dashboard':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <AlertTriangle className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.dashboard}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'declarations':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-center">
            {vehicle.damageInfo ? (
              <div className="inline-flex items-center gap-1.5">
                <FileText className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {vehicle.damageInfo.damageCounts.declarations}
                </span>
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      default:
        return null;
    }
  };

  return (
    <tr
      className={clsx(
        'hover:bg-gray-50 transition-colors',
        (isSelectionMode || onClick) && 'cursor-pointer',
        isSelected && 'bg-blue-50'
      )}
      onClick={handleRowClick}
    >
      {isSelectionMode && (
        <td
          className="px-6 py-4 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleCheckboxClick}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </td>
      )}
      {columnOrder.map(columnId => renderCell(columnId))}
      {false && visibleColumns.vehicle && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            {shouldShowImage ? (
              <img
                className="h-12 w-20 rounded-lg object-cover"
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
              />
            ) : (
              <div className="h-12 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {vehicle.make} {vehicle.model}
              </div>
              <div className="text-sm text-gray-500">
                {vehicle.registration} • {vehicle.year}
              </div>
            </div>
          </div>
        </td>
      )}
      {visibleColumns.company && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{vehicle.companyName}</div>
          <div className="text-sm text-gray-500">{vehicle.customerEmail}</div>
        </td>
      )}
      {visibleColumns.status && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col gap-1">
            <StatusBadge status={vehicle.status} />
            {statusInfo.badge && (
              <div className={clsx(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border',
                getBadgeColorClasses(statusInfo.badge.color)
              )}>
                {statusInfo.badge.color === 'green' ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {statusInfo.badge.text}
              </div>
            )}
            {vehicle.sharedReport && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                <Share2 className="w-3 h-3" />
                <span>Shared</span>
              </div>
            )}
          </div>
        </td>
      )}
      {visibleColumns.inspectionDate && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatDate(vehicle.inspectionDate)}
        </td>
      )}
      {visibleColumns.inspectionId && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {vehicle.reportId ? (
            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{vehicle.reportId}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.mileage && (
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {vehicle.mileage.toLocaleString()} km
        </td>
      )}
      {visibleColumns.value && (
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(vehicle.estimatedValue)}
          </div>
          {vehicle.estimatedCost > 0 && (
            <div className="text-sm text-red-600">
              Cost: {formatCurrency(vehicle.estimatedCost)}
            </div>
          )}
        </td>
      )}
      {visibleColumns.tags && (
        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {vehicle.tags && vehicle.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {vehicle.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            <TagManager
              vehicleId={vehicle.id}
              currentTags={vehicle.tags || []}
              onTagsUpdated={() => window.location.reload()}
            />
          </div>
        </td>
      )}
      {visibleColumns.carBody && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <CarFront className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.carBody}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.rim && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.rims}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.glass && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <WindshieldIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.glazing}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.interior && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <CarSeatIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.interior}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.tires && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.tires}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {visibleColumns.dashboard && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <AlertTriangle className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.dashboard}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      {false && visibleColumns.declarations && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <FileText className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                {vehicle.damageInfo.damageCounts.declarations}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </td>
      )}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative" ref={actionsMenuRef}>
          <button
            onClick={handleActionsClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Actions"
          >
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </button>

          {showActionsMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu">
                <button
                  onClick={handleDownloadReport}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  <Download className="h-4 w-4" />
                  Download Report
                </button>
                <button
                  onClick={handleOpenUrlReport}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open URL Report
                </button>
                {(vehicle.status === 'inspected' || vehicle.status === 'to_review') && (
                  <button
                    onClick={handleShareReport}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    role="menuitem"
                  >
                    <Share2 className="h-4 w-4" />
                    Share Report
                  </button>
                )}
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  role="menuitem"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export Data
                </button>
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};
