import React from 'react';
import clsx from 'clsx';
import { VehicleStatus, InspectionStatus } from '../../types';

interface StatusBadgeProps {
  status: VehicleStatus | InspectionStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig = {
  // Vehicle statuses
  link_sent: {
    label: 'Link Sent',
    color: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-400'
  },
  chased_up_1: {
    label: 'Chased-up (1st)',
    color: 'bg-orange-100 text-orange-800',
    dot: 'bg-orange-400'
  },
  chased_up_2: {
    label: 'Chased-up (2nd)',
    color: 'bg-red-100 text-red-800',
    dot: 'bg-red-400'
  },
  chased_up_manual: {
    label: 'Chased-up (Manual)',
    color: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-400'
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
  className 
}) => {
  const config = statusConfig[status];
  
  if (!config) {
    return (
      <span className={clsx('inline-flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full', className)}>
        {status}
      </span>
    );
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span 
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        config.color,
        sizeClasses,
        className
      )}
    >
      <div className={clsx('w-2 h-2 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};