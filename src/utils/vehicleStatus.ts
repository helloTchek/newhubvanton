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
  if (baseStatus === 'completed') {
    if (isFastTrackDisabled && !manualReviewCompleted) {
      return {
        status: 'completed',
        displayStatus: 'Completed',
        badge: {
          text: 'Review Pending',
          color: 'yellow'
        },
        needsReview: true
      };
    }

    return {
      status: 'completed',
      displayStatus: 'Completed',
      badge: null,
      needsReview: false
    };
  }

  if (baseStatus === 'in_review') {
    return {
      status: 'in_review',
      displayStatus: 'In Review',
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
    created: 'Created',
    in_progress: 'In Progress',
    in_review: 'In Review',
    completed: 'Completed',
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
