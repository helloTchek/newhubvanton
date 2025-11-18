import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Home, Wind, AlertCircle, FileText, Circle } from 'lucide-react';
import { VehicleStatus } from '../../types';

interface DamageCategory {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  label: string;
  sectionId: string;
}

interface DamagedPartsColumnProps {
  vehicleId: string;
  reportId: string;
  vehicleStatus: VehicleStatus;
  damageCounts: {
    carBody: number;
    interior: number;
    glazing: number;
    dashboard: number;
    declarations: number;
    tires: number;
    rims: number;
  };
}

export const DamagedPartsColumn: React.FC<DamagedPartsColumnProps> = ({
  vehicleId,
  reportId,
  vehicleStatus,
  damageCounts
}) => {
  const navigate = useNavigate();

  const categories: DamageCategory[] = [
    { icon: Car, count: damageCounts.carBody, label: 'Car body', sectionId: 'section-body' },
    { icon: Home, count: damageCounts.interior, label: 'Interior', sectionId: 'section-interior' },
    { icon: Wind, count: damageCounts.glazing, label: 'Glazing', sectionId: 'section-glass' },
    { icon: AlertCircle, count: damageCounts.dashboard, label: 'Dashboard', sectionId: 'section-motor' },
    { icon: FileText, count: damageCounts.declarations, label: 'Declarations', sectionId: 'section-documents' },
    { icon: Circle, count: damageCounts.tires, label: 'Tires', sectionId: 'section-tires' },
    { icon: Circle, count: damageCounts.rims, label: 'Rims', sectionId: 'section-rim' }
  ];

  const handleCategoryClick = (e: React.MouseEvent, sectionId: string, hasIssues: boolean) => {
    e.stopPropagation();
    if (hasIssues) {
      if (vehicleStatus === 'to_review') {
        navigate(`/damage-review/${reportId}?section=${sectionId}`);
      } else if (vehicleStatus === 'inspected') {
        navigate(`/vehicles/${vehicleId}?section=${sectionId}`);
      }
    }
  };

  return (
    <div className="flex items-center gap-4">
      {categories.map((category) => {
        const Icon = category.icon;
        const hasIssues = category.count > 0;

        return (
          <button
            key={category.label}
            onClick={(e) => handleCategoryClick(e, category.sectionId, hasIssues)}
            className={`flex items-center gap-1.5 ${hasIssues ? 'cursor-pointer hover:opacity-75 transition-opacity' : 'cursor-default'}`}
            title={`${category.label}: ${category.count} damaged parts${hasIssues ? ' - Click to view' : ''}`}
            disabled={!hasIssues}
          >
            <Icon className={`w-5 h-5 ${hasIssues ? 'text-red-500' : 'text-gray-300'}`} />
            <span className={`text-sm font-medium ${hasIssues ? 'text-red-600' : 'text-gray-400'}`}>
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
