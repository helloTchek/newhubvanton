import React, { useState } from 'react';
import { Calendar, MapPin, User, DollarSign, Bell, Share2, AlertTriangle, CarFront, FileText, Disc } from 'lucide-react';
import { Vehicle, VehicleStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChaseUpModal } from './ChaseUpModal';
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
  onChaseUp?: (vehicleId: string, method: 'email' | 'sms') => Promise<void>;
  onShareReport?: (vehicle: Vehicle) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (vehicleId: string) => void;
  visibleFields?: {
    company: boolean;
    customerEmail: boolean;
    inspectionDate: boolean;
    mileage: boolean;
    repairCost: boolean;
    value: boolean;
    damageResults: boolean;
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
    company: true,
    customerEmail: true,
    inspectionDate: true,
    mileage: true,
    repairCost: true,
    value: true,
    damageResults: true
  }
}) => {
  const { t } = useTranslation('vehicles');
  const [isChaseUpModalOpen, setIsChaseUpModalOpen] = useState(false);

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

  const handleChaseUp = async (vehicleId: string, method: 'email' | 'sms') => {
    if (onChaseUp) {
      await onChaseUp(vehicleId, method);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShareReport) {
      onShareReport(vehicle);
    }
  };

  return (
    <>
      <div
        className={clsx(
          'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 relative',
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
        {/* Vehicle Image or Placeholder */}
        {shouldShowImage ? (
          <div className="aspect-video relative">
            <img
              src={vehicle.imageUrl}
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
          </div>
        ) : (
          <div className="aspect-video relative bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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

        {/* Vehicle Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.make} {vehicle.model}
              </h3>
              <p className="text-sm text-gray-600">{vehicle.year}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{vehicle.registration}</p>
              {visibleFields.mileage && (
                <p className="text-sm text-gray-500">{vehicle.mileage.toLocaleString()} km</p>
              )}
            </div>
          </div>

          {/* Additional Info Grid */}
          <div className="space-y-3">
            {visibleFields.company && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{vehicle.companyName}</span>
              </div>
            )}

            {visibleFields.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{vehicle.customerEmail}</span>
              </div>
            )}

            {visibleFields.inspectionDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Inspected: {formatDate(vehicle.inspectionDate)}</span>
              </div>
            )}

            {visibleFields.repairCost && vehicle.estimatedCost > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-red-500" />
                <span className="text-red-600 font-medium">
                  Repair cost: {formatCurrency(vehicle.estimatedCost)}
                </span>
              </div>
            )}
          </div>

          {/* Damage Results */}
          {visibleFields.damageResults && vehicle.damageInfo && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-4 gap-x-3 gap-y-2">
                <div className="flex items-center gap-1.5" title="Car Body">
                  <CarFront className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.carBody > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.carBody}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Rims">
                  <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.rims > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.rims}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Glass">
                  <WindshieldIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.glazing > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.glazing}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Interior">
                  <CarSeatIcon className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.interior > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.interior}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Tires">
                  <Disc className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.tires > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.tires}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Dashboard">
                  <AlertTriangle className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.dashboard > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.dashboard}
                  </span>
                </div>
                <div className="flex items-center gap-1.5" title="Declarations">
                  <FileText className={`w-5 h-5 ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-500' : 'text-gray-300'}`} />
                  <span className={`text-sm font-medium ${vehicle.damageInfo.damageCounts.declarations > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {vehicle.damageInfo.damageCounts.declarations}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Value or Chase Up Button */}
          <div className="pt-4 border-t border-gray-100">
            {shouldShowChaseUp ? (
              <button
                onClick={handleChaseUpClick}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors font-medium"
              >
                <Bell className="w-4 h-4" />
                <span>Chase Up?</span>
              </button>
            ) : (
              <div className="space-y-3">
                {visibleFields.value && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estimated Value</span>
                    <span className="text-lg font-semibold text-green-600">
                      {formatCurrency(vehicle.estimatedValue)}
                    </span>
                  </div>
                )}
                {vehicle.reportId && onShareReport && (vehicle.status === 'inspected' || vehicle.status === 'to_review') && (
                  <button
                    onClick={handleShareClick}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share Report</span>
                  </button>
                )}
              </div>
            )}
          </div>
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
