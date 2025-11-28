import React, { useState } from 'react';
import clsx from 'clsx';
import { VehicleStatus, InspectionStatus } from '../../types';

interface StatusBadgeProps {
  status: VehicleStatus | InspectionStatus;
  size?: 'sm' | 'md';
  className?: string;
  statusUpdatedAt?: string;
}

const statusConfig = {
  // Vehicle statuses
  link_sent: {
    label: 'Created',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-400'
  },
  chased_up: {
    label: 'ChaseUp',
    color: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-400'
  },
  inspection_in_progress: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-400'
  },
  inspected: {
    label: 'Inspected',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-400'
  },
  to_review: {
    label: 'To Review',
    color: 'bg-purple-100 text-purple-800',
    dot: 'bg-purple-400'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-800',
    dot: 'bg-gray-400'
  },
  // Inspection statuses
  passed: {
    label: 'Passed',
    color: 'bg-green-100 text-green-800',
    dot: 'bg-green-400'
  },
  minor_issues: {
    label: 'Minor Issues',
    color: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-400'
  },
  major_issues: {
    label: 'Major Issues',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-400'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-500'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  statusUpdatedAt
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const config = statusConfig[status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const tooltipText = statusUpdatedAt ? `since ${formatDate(statusUpdatedAt)}` : null;

  if (!config) {
    return (
      <span
        className={clsx('inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full', className)}
      >
        {status}
      </span>
    );
  }

  const sizeClasses = size === 'sm'
    ? 'px-2 py-1 text-xs'
    : 'px-3 py-1 text-sm';

  return (
    <div className="relative inline-block">
      <span
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full cursor-default',
          config.color,
          sizeClasses,
          className
        )}
        onMouseEnter={() => tooltipText && setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <div className={clsx('w-2 h-2 rounded-full', config.dot)} />
        {config.label}
      </span>
      {showTooltip && tooltipText && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none">
          {tooltipText}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};