import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bell, CheckCircle, AlertCircle, Download, Share2, FileSpreadsheet, MoreVertical, Car, Disc, Waves, Armchair, AlertTriangle, FileText, ScrollText } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { getVehicleStatusInfo, getBadgeColorClasses } from '../../utils/vehicleStatus';
import clsx from 'clsx';

interface VehicleTableRowProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onShareReport?: (vehicle: Vehicle) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (vehicleId: string) => void;
  visibleColumns?: {
    vehicle: boolean;
    company: boolean;
    status: boolean;
    inspectionDate: boolean;
    mileage: boolean;
    value: boolean;
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
  visibleColumns = {
    vehicle: true,
    company: true,
    status: true,
    inspectionDate: true,
    mileage: true,
    value: true,
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
      {visibleColumns.vehicle && (
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
      {visibleColumns.carBody && (
        <td className="px-6 py-4 whitespace-nowrap text-center">
          {vehicle.damageInfo ? (
            <div className="inline-flex items-center gap-1.5">
              <Car className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-500' : 'text-gray-300'}`} />
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
              <Waves className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-500' : 'text-gray-300'}`} />
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
              <Armchair className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-500' : 'text-gray-300'}`} />
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
      {visibleColumns.declarations && (
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
