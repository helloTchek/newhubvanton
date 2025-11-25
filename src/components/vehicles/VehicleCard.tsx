import React, { useState, useRef, useEffect } from 'react';
import { Calendar, MapPin, User, DollarSign, Bell, Share2, AlertTriangle, CarFront, FileText, Disc, MoreVertical, Download, FileSpreadsheet, ExternalLink, ChevronLeft, ChevronRight, FileCheck } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChaseUpModal } from './ChaseUpModal';
import { TagManager } from './TagManager';
import { getInspectionTypeLabel, getInspectionTypeColor } from '../../utils/inspectionType';
import { useTranslation } from 'react-i18next';
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

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: () => void;
  onChaseUp?: (vehicleId: string, method: 'email' | 'sms', message?: string) => Promise<void>;
  onShareReport?: (vehicle: Vehicle) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (vehicleId: string) => void;
  visibleFields?: {
    image: boolean;
    registration: boolean;
    vin: boolean;
    makeModel: boolean;
    age: boolean;
    mileage: boolean;
    company: boolean;
    customerEmail: boolean;
    inspectionDate: boolean;
    inspectionId: boolean;
    inspectionType: boolean;
    repairCost: boolean;
    value: boolean;
    damageResults: boolean;
    tags: boolean;
  };
}

const statusesWithoutImages: VehicleStatus[] = [
  'link_sent',
  'chased_up_1',
  'chased_up_2',
  'inspection_in_progress'
];

const statusesWithChaseUp: VehicleStatus[] = [
  'link_sent',
  'chased_up_1',
  'chased_up_2',
  'inspection_in_progress'
];

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onClick,
  onChaseUp,
  onShareReport,
  isSelectionMode = false,
  isSelected = false,
  onSelectToggle,
  visibleFields = {
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
    inspectionType: true,
    repairCost: true,
    value: true,
    damageResults: true,
    tags: true
  }
}) => {
  const { t } = useTranslation('vehicles');
  const [isChaseUpModalOpen, setIsChaseUpModalOpen] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  const images = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.imageUrl];
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    };

    if (isActionsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isActionsMenuOpen]);

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
  const shouldShowChaseUp = statusesWithChaseUp.includes(vehicle.status);

  const handleCardClick = () => {
    if (isSelectionMode && onSelectToggle) {
      onSelectToggle(vehicle.id);
    } else if (!shouldShowChaseUp && onClick) {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectToggle) {
      onSelectToggle(vehicle.id);
    }
  };

  const handleChaseUpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsChaseUpModalOpen(true);
  };

  const handleChaseUp = async (vehicleId: string, method: 'email' | 'sms', message?: string) => {
    if (onChaseUp) {
      await onChaseUp(vehicleId, method, message);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareReport) {
      onShareReport(vehicle);
    }
  };

  const handleDownloadReport = (e: React.MouseEvent, withCosts: boolean) => {
    e.stopPropagation();
    setIsActionsMenuOpen(false);
    console.log('Download report for vehicle:', vehicle.id, 'with costs:', withCosts);
  };

  const handleShareFromMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsMenuOpen(false);
    if (onShareReport) {
      onShareReport(vehicle);
    }
  };

  const handleOpenUrlReport = (e: React.MouseEvent, withCosts: boolean) => {
    e.stopPropagation();
    setIsActionsMenuOpen(false);
    const reportUrl = `/vehicle/${vehicle.id}/report?costs=${withCosts}`;
    window.open(reportUrl, '_blank');
  };

  const handleExportData = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionsMenuOpen(false);
    console.log('Export data for vehicle:', vehicle.id);
  };

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <>
      <div
        className={clsx(
          'bg-white rounded-xl shadow-sm border border-gray-200 transition-all duration-200 relative',
          !shouldShowChaseUp && onClick && 'cursor-pointer hover:shadow-md hover:border-blue-200',
          isSelectionMode && 'cursor-pointer',
          isSelected && 'ring-2 ring-blue-500'
        )}
        onClick={handleCardClick}
      >
        {isSelectionMode && (
          <div
            className="absolute top-3 left-3 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleCheckboxClick}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </div>
        )}

        {/* Actions Menu Button - Top Right */}
        {!isSelectionMode && (shouldShowChaseUp || (vehicle.status === 'inspected' || vehicle.status === 'to_review')) && (
          <div className="absolute top-3 left-3 z-10" ref={actionsMenuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsActionsMenuOpen(!isActionsMenuOpen);
              }}
              className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
            {isActionsMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
                {shouldShowChaseUp && onChaseUp && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsActionsMenuOpen(false);
                        setIsChaseUpModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 transition-colors font-medium"
                    >
                      <Bell className="w-4 h-4 text-orange-600" />
                      <span>Chase Up Customer</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}
                {onShareReport && (vehicle.status === 'inspected' || vehicle.status === 'to_review') && (
                  <>
                    <button
                      onClick={handleShareFromMenu}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors font-medium"
                    >
                      <Share2 className="w-4 h-4 text-blue-600" />
                      <span>Share Updated Report</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                  </>
                )}
                <button
                  onClick={(e) => handleDownloadReport(e, true)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download with repair costs</span>
                </button>
                <button
                  onClick={(e) => handleDownloadReport(e, false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download without repair costs</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={(e) => handleOpenUrlReport(e, true)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open with repair costs</span>
                </button>
                <button
                  onClick={(e) => handleOpenUrlReport(e, false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open without repair costs</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleExportData}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              </div>
            )}
          </div>
        )}
        {/* Vehicle Image or Placeholder */}
        {visibleFields.image && (
          <>
            {shouldShowImage ? (
              <div className="aspect-video relative overflow-hidden rounded-t-xl group">
                <img
                  src={images[currentImageIndex]}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <StatusBadge status={vehicle.status} />
                  {vehicle.sharedReport && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Share2 className="w-3 h-3" />
                      <span>{t('share.sharedBadge')}</span>
                    </div>
                  )}
                </div>

                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-800" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-800" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentImageIndex(index);
                          }}
                          className={clsx(
                            'w-2 h-2 rounded-full transition-all',
                            index === currentImageIndex
                              ? 'bg-white w-6'
                              : 'bg-white/60 hover:bg-white/80'
                          )}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden rounded-t-xl">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600">Awaiting Inspection</p>
                </div>
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <StatusBadge status={vehicle.status} />
                  {vehicle.sharedReport && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      <Share2 className="w-3 h-3" />
                      <span>{t('share.sharedBadge')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Vehicle Info */}
        <div className="p-4">
          {/* Vertical vehicle information */}
          <div className="space-y-1 mb-3">
            {visibleFields.registration && (
              <h3 className="text-lg font-bold text-gray-900">{vehicle.registration}</h3>
            )}

            {visibleFields.vin && vehicle.vin && (
              <p className="text-xs font-mono text-gray-600">{vehicle.vin}</p>
            )}

            {visibleFields.makeModel && (
              <p className="text-base font-semibold text-gray-900">
                {vehicle.make} {vehicle.model}
              </p>
            )}

            {visibleFields.age && (
              <p className="text-sm text-gray-600">{vehicle.year} ({new Date().getFullYear() - vehicle.year} years old)</p>
            )}

            {visibleFields.mileage && (
              <p className="text-sm text-gray-600">{vehicle.mileage.toLocaleString()} km</p>
            )}
          </div>

          {/* Tags Section with Manager */}
          {visibleFields.tags && (
            <div className="flex flex-wrap items-center gap-1.5 mb-2" onClick={(e) => e.stopPropagation()}>
              {vehicle.tags && vehicle.tags.length > 0 && (
                vehicle.tags.map(tag => (
                  <div
                    key={tag.id}
                    className="px-2 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </div>
                ))
              )}
              <TagManager
                vehicleId={vehicle.id}
                currentTags={vehicle.tags || []}
                onTagsUpdated={() => window.location.reload()}
              />
            </div>
          )}

          {/* Additional Info Grid */}
          <div className="space-y-2">
            {visibleFields.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{vehicle.companyName}</span>
              </div>
            )}

            {visibleFields.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4 flex-shrink-0" />
                <span>{vehicle.customerEmail}</span>
              </div>
            )}

            {visibleFields.inspectionDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>{formatDate(vehicle.inspectionDate)}</span>
              </div>
            )}

            {visibleFields.inspectionId && vehicle.reportId && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <span>{vehicle.reportId}</span>
              </div>
            )}

            {visibleFields.inspectionType && vehicle.inspectionType && (
              <div className="flex items-center gap-2 text-sm">
                <FileCheck className="w-4 h-4 flex-shrink-0 text-gray-500" />
                <span className={clsx(
                  'px-2 py-0.5 rounded-full text-xs font-medium',
                  getInspectionTypeColor(vehicle.inspectionType)
                )}>
                  {getInspectionTypeLabel(vehicle.inspectionType)}
                </span>
              </div>
            )}

            {visibleFields.repairCost && vehicle.estimatedCost > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 flex-shrink-0 text-red-500" />
                <span className="text-red-600 font-medium">
                  {formatCurrency(vehicle.estimatedCost)}
                </span>
              </div>
            )}
          </div>

          {/* Damage Results */}
          {visibleFields.damageResults && vehicle.damageInfo && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-x-2 gap-y-1.5">
                <div className="flex items-center gap-1" title="Car Body">
                  <CarFront className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.carBody}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Rims">
                  <Disc className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.rims}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Glass">
                  <WindshieldIcon className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.glazing}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Interior">
                  <CarSeatIcon className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.interior}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Tires">
                  <Disc className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.tires}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Dashboard">
                  <AlertTriangle className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.dashboard}
                  </span>
                </div>
                <div className="flex items-center gap-1" title="Declarations">
                  <FileText className={`w-4 h-4 ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-xs font-medium ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.declarations}
                  </span>
                </div>
              </div>
            </div>
          )}


          {/* Value */}
          {visibleFields.value && !shouldShowChaseUp && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Estimated Value</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(vehicle.estimatedValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {onChaseUp && (
        <ChaseUpModal
          vehicle={vehicle}
          isOpen={isChaseUpModalOpen}
          onClose={() => setIsChaseUpModalOpen(false)}
          onChaseUp={handleChaseUp}
        />
      )}
    </>
  );
};
