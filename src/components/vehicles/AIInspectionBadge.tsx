import React from 'react';
import { Camera, Sparkles, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { AIInspectionInfo, ImageQuality, AIInspectionStatus } from '../../types';

interface AIInspectionBadgeProps {
  info: AIInspectionInfo;
}

const getImageQualityConfig = (quality: ImageQuality) => {
  switch (quality) {
    case 'good':
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'Good' };
    case 'acceptable':
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'OK' };
    case 'bad':
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Bad' };
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-50', label: '-' };
  }
};

const getAIStatusConfig = (status: AIInspectionStatus) => {
  switch (status) {
    case 'worked':
      return { color: 'text-green-600', bg: 'bg-green-50', label: 'OK' };
    case 'light_issue':
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Light' };
    case 'did_not_work':
      return { color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' };
    default:
      return { color: 'text-gray-400', bg: 'bg-gray-50', label: '-' };
  }
};

export const AIInspectionBadge: React.FC<AIInspectionBadgeProps> = ({ info }) => {
  const imageQuality = getImageQualityConfig(info.imageQuality);
  const aiStatus = getAIStatusConfig(info.aiStatus);

  return (
    <div className="flex items-center gap-1.5 text-xs">
      {/* Image Quality */}
      <div
        className={clsx('flex items-center gap-1 px-1.5 py-0.5 rounded', imageQuality.bg)}
        title={`Image Quality: ${imageQuality.label}`}
      >
        <Camera className={clsx('w-3 h-3', imageQuality.color)} />
        <span className={clsx('font-medium', imageQuality.color)}>{imageQuality.label}</span>
      </div>

      {/* AI Inspection Status */}
      <div
        className={clsx('flex items-center gap-1 px-1.5 py-0.5 rounded', aiStatus.bg)}
        title={`AI Inspection: ${aiStatus.label}`}
      >
        <Sparkles className={clsx('w-3 h-3', aiStatus.color)} />
        <span className={clsx('font-medium', aiStatus.color)}>{aiStatus.label}</span>
      </div>

      {/* Manual Review */}
      {info.manualReviewCompleted && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50"
          title="Manual Review Completed"
        >
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span className="font-medium text-blue-600">✓</span>
        </div>
      )}
    </div>
  );
};
