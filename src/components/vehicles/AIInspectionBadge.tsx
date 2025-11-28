import React from 'react';
import { Camera, User, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import { AIInspectionInfo, ImageQuality } from '../../types';

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

export const AIInspectionBadge: React.FC<AIInspectionBadgeProps> = ({ info }) => {
  const imageQuality = getImageQualityConfig(info.imageQuality);
  const showAIInspection = info.aiStatus === 'worked';

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

      {/* AI Inspection Status - Only show when done */}
      {showAIInspection && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-50"
          title="AI Inspection Complete"
        >
          <Sparkles className="w-3 h-3 text-green-600" />
          <span className="font-medium text-green-600">AI</span>
        </div>
      )}

      {/* Manual Review - Customer or Tchek */}
      {info.manualReviewType === 'customer' && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50"
          title="Customer Manual Review"
        >
          <User className="w-3 h-3 text-blue-600" />
          <span className="font-medium text-blue-600">Customer</span>
        </div>
      )}

      {info.manualReviewType === 'tchek' && (
        <div
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-50"
          title="Tchek Manual Review"
        >
          <img
            src="/logo_tchek-web.png"
            alt="Tchek"
            className="w-3 h-3 object-contain"
          />
          <span className="font-medium text-purple-600">Tchek</span>
        </div>
      )}
    </div>
  );
};
