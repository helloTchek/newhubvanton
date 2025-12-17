import React, { useState, useRef, useEffect } from 'react';
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
  created: {
    label: 'Created',
    color: 'bg-blue-50 text-blue-700',
    dot: 'bg-[#0062FF]'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-orange-50 text-orange-700',
    dot: 'bg-[#F59E0B]'
  },
  in_review: {
    label: 'In Review',
    color: 'bg-purple-50 text-purple-700',
    dot: 'bg-[#9333EA]'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-50 text-green-700',
    dot: 'bg-[#22C55E]'
  },
  archived: {
    label: 'Archived',
    color: 'bg-gray-100 text-gray-600',
    dot: 'bg-[#9CA3AF]'
  },
  // Inspection statuses
  passed: {
    label: 'Passed',
    color: 'bg-green-50 text-green-700',
    dot: 'bg-[#22C55E]'
  },
  minor_issues: {
    label: 'Minor Issues',
    color: 'bg-orange-50 text-orange-700',
    dot: 'bg-[#F59E0B]'
  },
  major_issues: {
    label: 'Major Issues',
    color: 'bg-red-50 text-red-700',
    dot: 'bg-[#EF4444]'
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-50 text-red-700',
    dot: 'bg-[#EF4444]'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  statusUpdatedAt
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const badgeRef = useRef<HTMLSpanElement>(null);
  const config = statusConfig[status];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const tooltipText = statusUpdatedAt ? `since ${formatDate(statusUpdatedAt)}` : null;

  const handleMouseEnter = () => {
    if (tooltipText && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: rect.left + rect.width / 2
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

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
    <>
      <span
        ref={badgeRef}
        className={clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full cursor-default',
          config.color,
          sizeClasses,
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={clsx('w-2 h-2 rounded-full', config.dot)} />
        {config.label}
      </span>
      {showTooltip && tooltipText && (
        <div
          className="fixed z-[9999] px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap pointer-events-none shadow-lg"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltipText}
        </div>
      )}
    </>
  );
};