import { VehicleStatus } from '../types';

interface VehicleStatusInfo {
  status: VehicleStatus;
  displayStatus: string;
  badge: {
    text: string;
    color: string;
  } | null;
  needsReview: boolean;
}

export function getVehicleStatusInfo(
  baseStatus: VehicleStatus,
  isFastTrackDisabled: boolean,
  manualReviewCompleted: boolean
): VehicleStatusInfo {
  if (baseStatus === 'inspected') {
    if (isFastTrackDisabled && !manualReviewCompleted) {
      return {
        status: 'inspected',
        displayStatus: 'Inspected',
        badge: {
          text: 'Review Pending',
          color: 'yellow'
        },
        needsReview: true
      };
    }

    if (!isFastTrackDisabled && manualReviewCompleted) {
      return {
        status: 'inspected',
        displayStatus: 'Inspected',
        badge: {
          text: 'Manual Review Completed',
          color: 'green'
        },
        needsReview: false
      };
    }

    return {
      status: 'inspected',
      displayStatus: 'Inspected',
      badge: null,
      needsReview: false
    };
  }

  if (!isFastTrackDisabled && baseStatus === 'inspected' && !manualReviewCompleted) {
    return {
      status: 'to_review',
      displayStatus: 'To Review',
      badge: {
        text: 'Pending Manual Review',
        color: 'orange'
      },
      needsReview: true
    };
  }

  return {
    status: baseStatus,
    displayStatus: getStatusLabel(baseStatus),
    badge: null,
    needsReview: false
  };
}

function getStatusLabel(status: VehicleStatus): string {
  const labels: Record<VehicleStatus, string> = {
    link_sent: 'Created',
    chased_up_1: 'ChaseUp',
    chased_up_2: 'ChaseUp',
    chased_up_manual: 'ChaseUp',
    inspection_in_progress: 'In Progress',
    inspected: 'Inspected',
    to_review: 'To Review',
    archived: 'Archived'
  };

  return labels[status] || status;
}

export function getBadgeColorClasses(color: string): string {
  const colors: Record<string, string> = {
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    blue: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
}
