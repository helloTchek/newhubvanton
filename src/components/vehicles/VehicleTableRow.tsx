import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Bell, CheckCircle, AlertCircle, Download, Share2, FileSpreadsheet, MoreVertical, CarFront, Disc, AlertTriangle, FileText, ScrollText, ExternalLink, FileCheck, ArchiveRestore } from 'lucide-react';
import { AIInspectionBadge } from './AIInspectionBadge';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { TagManager } from './TagManager';
import { InspectionDateSelector } from './InspectionDateSelector';
import { getVehicleStatusInfo, getBadgeColorClasses } from '../../utils/vehicleStatus';
import { getInspectionTypeLabel, getInspectionTypeColor } from '../../utils/inspectionType';
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
  onChaseUp?: (vehicleId: string) => void;
  onUnarchive?: (vehicleId: string) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (vehicleId: string) => void;
  isMenuOpen?: boolean;
  onMenuToggle?: (isOpen: boolean) => void;
  columnOrder?: string[];
  visibleColumns?: {
    image: boolean;
    registration: boolean;
    vin: boolean;
    makeModel: boolean;
    company: boolean;
    customerEmail: boolean;
    status: boolean;
    inspectionDate: boolean;
    inspectionId: boolean;
    inspectionType: boolean;
    aiInspectionBadge: boolean;
    mileage: boolean;
    value: boolean;
    repairCost: boolean;
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
  'chased_up',
  'inspection_in_progress'
];

export const VehicleTableRow: React.FC<VehicleTableRowProps> = ({
  vehicle,
  onClick,
  onShareReport,
  onChaseUp,
  onUnarchive,
  isSelectionMode = false,
  isSelected = false,
  onSelectToggle,
  isMenuOpen = false,
  onMenuToggle,
  columnOrder = [
    'image', 'registration', 'vin', 'makeModel', 'company', 'customerEmail', 'status', 'inspectionDate', 'inspectionId', 'inspectionType', 'aiInspectionBadge',
    'mileage', 'value', 'repairCost', 'tags', 'carBody', 'rim', 'glass',
    'interior', 'tires', 'dashboard', 'declarations'
  ],
  visibleColumns = {
    image: true,
    registration: true,
    vin: true,
    makeModel: true,
    company: true,
    customerEmail: true,
    status: true,
    inspectionDate: true,
    inspectionId: true,
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
  }
}) => {
  const [downloadSubmenuOpen, setDownloadSubmenuOpen] = useState(false);
  const [openUrlSubmenuOpen, setOpenUrlSubmenuOpen] = useState(false);
  const [isInspectionDateSelectorOpen, setIsInspectionDateSelectorOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not inspected';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shouldShowImage = !statusesWithoutImages.includes(vehicle.status);
  const hasInspection = !!vehicle.reportId || !!vehicle.inspectionDate;

  const statusInfo = getVehicleStatusInfo(
    vehicle.status,
    vehicle.isFastTrackDisabled || false,
    vehicle.manualReviewCompleted || false
  );

  const handleRowClick = () => {
    // Prevent clicks on archived vehicles
    if (vehicle.status === 'archived') {
      return;
    }

    if (isSelectionMode && onSelectToggle) {
      onSelectToggle(vehicle.id);
    } else if (hasInspection && onClick) {
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
    if (!isMenuOpen && actionsButtonRef.current) {
      const rect = actionsButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      });
    }
    onMenuToggle?.(!isMenuOpen);
  };

  const handleDownloadReport = (e: React.MouseEvent, withCosts: boolean) => {
    e.stopPropagation();
    console.log('Download report for vehicle:', vehicle.id, 'with costs:', withCosts);
    onMenuToggle?.(false);
    setDownloadSubmenuOpen(false);
  };

  const handleShareReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareReport) {
      onShareReport(vehicle);
    }
    onMenuToggle?.(false);
  };

  const handleChaseUpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChaseUp) {
      onChaseUp(vehicle.id);
    }
    onMenuToggle?.(false);
  };

  const handleExportData = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Export data for vehicle:', vehicle.id);
    onMenuToggle?.(false);
  };

  const handleUnarchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUnarchive) {
      onUnarchive(vehicle.id);
    }
    onMenuToggle?.(false);
  };

  const handleOpenUrlReport = (e: React.MouseEvent, withCosts: boolean) => {
    e.stopPropagation();
    const reportUrl = `/vehicle/${vehicle.id}/report?costs=${withCosts}`;
    window.open(reportUrl, '_blank');
    onMenuToggle?.(false);
    setOpenUrlSubmenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      onMenuToggle?.(false);
    };

    if (isMenuOpen) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    } else {
      // Close submenus when main menu closes
      setDownloadSubmenuOpen(false);
      setOpenUrlSubmenuOpen(false);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isMenuOpen, onMenuToggle]);

  const renderCell = (columnId: string) => {
    if (!visibleColumns[columnId as keyof typeof visibleColumns]) return null;

    switch (columnId) {
      case 'image':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            {shouldShowImage ? (
              <img
                className="h-12 w-20 rounded-lg object-cover"
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="h-12 w-20 rounded-lg bg-gray-100 items-center justify-center"
              style={{ display: shouldShowImage ? 'none' : 'flex' }}
            >
              <Bell className="w-5 h-5 text-gray-400" />
            </div>
          </td>
        );

      case 'registration':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {vehicle.registration}
            </div>
          </td>
        );

      case 'vin':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-mono text-gray-900">
              {vehicle.vin || '-'}
            </div>
          </td>
        );

      case 'makeModel':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {vehicle.make} {vehicle.model}
            </div>
            <div className="text-sm text-gray-500">
              {vehicle.year}
            </div>
          </td>
        );

      case 'company':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{vehicle.companyName}</div>
          </td>
        );

      case 'customerEmail':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-900">{vehicle.customerEmail || '-'}</div>
          </td>
        );

      case 'status':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            <div className="flex flex-col gap-1">
              <StatusBadge status={vehicle.status} statusUpdatedAt={vehicle.statusUpdatedAt} />
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
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-sm">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsInspectionDateSelectorOpen(true);
              }}
              className={clsx(
                "hover:text-blue-600 hover:underline transition-colors",
                vehicle.inspectionDate ? "text-gray-900" : "text-gray-400 italic"
              )}
              title="View inspection history"
            >
              {formatDate(vehicle.inspectionDate)}
            </button>
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

      case 'externalId':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {vehicle.externalId ? (
              <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{vehicle.externalId}</span>
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
          </td>
        );

      case 'repairCost':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            {vehicle.estimatedCost > 0 ? (
              <div className="text-sm font-medium text-red-600">
                {formatCurrency(vehicle.estimatedCost)}
              </div>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'inspectionType':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            {vehicle.inspectionType ? (
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getInspectionTypeColor(vehicle.inspectionType)
              )}>
                {getInspectionTypeLabel(vehicle.inspectionType)}
              </span>
            ) : (
              <span className="text-sm text-gray-400">-</span>
            )}
          </td>
        );

      case 'aiInspectionBadge':
        return (
          <td key={columnId} className="px-6 py-4 whitespace-nowrap">
            {vehicle.aiInspectionInfo ? (
              <AIInspectionBadge info={vehicle.aiInspectionInfo} />
            ) : (
              <span className="text-sm text-gray-400">-</span>
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
        'group transition-colors',
        vehicle.status === 'archived' && 'opacity-60 cursor-not-allowed',
        vehicle.status !== 'archived' && hasInspection && 'hover:bg-gray-50',
        vehicle.status !== 'archived' && !hasInspection && 'cursor-not-allowed opacity-60',
        vehicle.status !== 'archived' && (isSelectionMode || (hasInspection && onClick)) && 'cursor-pointer',
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
      <td className={clsx(
        "sticky right-0 px-3 py-4 whitespace-nowrap text-center border-l border-gray-200",
        isMenuOpen ? 'z-[10000]' : 'z-30',
        isSelected ? 'bg-blue-50' : 'bg-white group-hover:bg-gray-50'
      )}>
        <div className="relative" ref={actionsMenuRef}>
          <button
            ref={actionsButtonRef}
            onClick={handleActionsClick}
            className="p-2 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg transition-all shadow-sm hover:shadow relative z-10"
            aria-label="Actions"
          >
            <MoreVertical className="h-5 w-5 text-gray-700" />
          </button>

          {isMenuOpen && menuPosition && (
            <>
              <div
                className="fixed inset-0 z-[9999] cursor-default"
                style={{ userSelect: 'none', pointerEvents: 'auto' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle?.(false);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              />
              <div
                ref={actionsMenuRef}
                className="fixed w-64 rounded-md shadow-2xl bg-white border border-gray-200 z-[10000]"
                style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
              >
                <div className="py-1" role="menu">
                {vehicle.status === 'archived' ? (
                  onUnarchive && (
                    <button
                      onClick={handleUnarchive}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-green-50 transition-colors font-medium"
                      role="menuitem"
                    >
                      <ArchiveRestore className="h-4 w-4 text-green-600" />
                      Unarchive Vehicle
                    </button>
                  )
                ) : (
                  <>
                    {onChaseUp && (
                      vehicle.status === 'link_sent' ||
                      vehicle.status === 'chased_up' ||
                      vehicle.status === 'inspection_in_progress'
                    ) && (
                      <>
                        <button
                          onClick={handleChaseUpClick}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors font-medium"
                          role="menuitem"
                        >
                          <Bell className="h-4 w-4 text-orange-600" />
                          Chase Up Customer
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    {onShareReport && (vehicle.status === 'inspected' || vehicle.status === 'to_review') && (
                      <>
                        <button
                          onClick={handleShareReport}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium"
                          role="menuitem"
                        >
                          <Share2 className="h-4 w-4 text-blue-600" />
                          Share Updated Report
                        </button>
                        <div className="border-t border-gray-100 my-1"></div>
                      </>
                    )}
                    <button
                      onClick={(e) => handleDownloadReport(e, true)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                    >
                      <Download className="h-4 w-4" />
                      Download with repair costs
                    </button>
                    <button
                      onClick={(e) => handleDownloadReport(e, false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                    >
                      <Download className="h-4 w-4" />
                      Download without repair costs
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={(e) => handleOpenUrlReport(e, true)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open with repair costs
                    </button>
                    <button
                      onClick={(e) => handleOpenUrlReport(e, false)}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open without repair costs
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleExportData}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      role="menuitem"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Data
                    </button>
                  </>
                )}
              </div>
            </div>
            </>
          )}
        </div>
      </td>

      {isInspectionDateSelectorOpen && (
        <InspectionDateSelector
          vehicle={vehicle}
          onClose={() => setIsInspectionDateSelectorOpen(false)}
          onSelectInspection={(vehicleId) => {
            if (onClick) {
              onClick();
            }
            window.location.href = `/vehicles/${vehicleId}`;
          }}
        />
      )}
    </tr>
  );
};
