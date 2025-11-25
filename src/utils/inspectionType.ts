import { InspectionType } from '../types';

export const getInspectionTypeLabel = (type?: InspectionType): string => {
  if (!type) return '-';

  const labels: Record<InspectionType, string> = {
    api: 'API',
    manual_upload: 'Manual Upload',
    remote_inspection: 'Remote Inspection',
    onsite_inspection: 'On-site Inspection'
  };

  return labels[type] || type;
};

export const getInspectionTypeColor = (type?: InspectionType): string => {
  if (!type) return 'bg-gray-100 text-gray-600';

  const colors: Record<InspectionType, string> = {
    api: 'bg-blue-100 text-blue-700',
    manual_upload: 'bg-purple-100 text-purple-700',
    remote_inspection: 'bg-green-100 text-green-700',
    onsite_inspection: 'bg-orange-100 text-orange-700'
  };

  return colors[type] || 'bg-gray-100 text-gray-600';
};
