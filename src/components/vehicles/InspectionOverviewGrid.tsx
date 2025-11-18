import React from 'react';
import { InspectionSection, InspectionItem, SectionStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, Eye, Clock, CheckSquare, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';

interface InspectionOverviewGridProps {
  sections: InspectionSection[];
  onSectionClick?: (sectionId: string) => void;
  onFastTrackClick?: (sectionId: string) => void;
  onValidateAllClick?: () => void;
}

export const InspectionOverviewGrid: React.FC<InspectionOverviewGridProps> = ({ 
  sections, 
  onSectionClick,
  onFastTrackClick,
  onValidateAllClick
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getSectionElementName = (sectionId: string) => {
    switch (sectionId) {
      case 'section-body':
        return 'parts';
      case 'section-rim':
        return 'rims';
      case 'section-interior':
        return 'elements';
      case 'section-tires':
        return 'tires';
      case 'section-motor':
        return 'components';
      case 'section-glass':
        return 'windows';
      case 'section-documents':
        return 'documents';
      case 'section-declaration':
        return 'items';
      default:
        return 'items';
    }
  };

  const getDamagedElementsInfo = (section: InspectionSection) => {
    const damagedItems = section.items.filter(item => item.status !== 'passed');
    const totalItems = section.items.length;
    const totalCost = damagedItems.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
    const elementName = getSectionElementName(section.id);
    
    return {
      damagedCount: damagedItems.length,
      totalCount: totalItems,
      totalCost,
      elementName,
      hasDamage: damagedItems.length > 0
    };
  };

  const getSectionStatusInfo = (sectionStatus: SectionStatus) => {
    switch (sectionStatus) {
      case 'missing_data':
        return {
          label: 'Missing Data',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertCircle className="w-3 h-3" />,
          hoverColor: 'hover:bg-red-200'
        };
      case 'needs_review':
        return {
          label: 'Needs Review',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Clock className="w-3 h-3" />,
          hoverColor: 'hover:bg-orange-200'
        };
      case 'reviewed':
        return {
          label: 'Reviewed',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: <CheckSquare className="w-3 h-3" />,
          hoverColor: 'hover:bg-green-200'
        };
      case 'inspect':
        return {
          label: 'Inspect',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Eye className="w-3 h-3" />,
          hoverColor: 'hover:bg-blue-200'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <AlertCircle className="w-3 h-3" />,
          hoverColor: 'hover:bg-gray-200'
        };
    }
  };

  const handleFastTrackClick = (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    onFastTrackClick?.(sectionId);
  };

  const handleValidateAllClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValidateAllClick?.();
  };

  // Filter only visible sections
  const visibleSections = sections.filter(section => section.isVisible);

  const getSeverityIcon = (item: InspectionItem) => {
    switch (item.status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'major_issues':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'minor_issues':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleSections.map((section) => {
          const sectionStatusInfo = getSectionStatusInfo(section.sectionStatus);
          const damageInfo = getDamagedElementsInfo(section);

        return (
          <div 
            key={section.id} 
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md hover:border-blue-300 transition-all duration-200"
            onClick={() => onSectionClick?.(section.id)}
          >
            {/* Section Header */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <h4 className="font-semibold text-gray-900 cursor-pointer">{section.name}</h4>
                </div>
                <div className="text-right">
                  {damageInfo.hasDamage ? (
                    <div>
                      <div className="text-sm font-medium text-red-600">
                        {damageInfo.damagedCount}/{damageInfo.totalCount} {damageInfo.elementName}
                      </div>
                      <div className="text-lg font-bold text-red-600">
                        {formatCurrency(damageInfo.totalCost)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm font-medium text-green-600">
                      All {damageInfo.elementName} OK
                    </div>
                  )}
                </div>
              </div>
              
              {/* Section Items */}
              <div className="space-y-2">
                {section.items.map((item) => {
                  return (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700">{item.name}</span>
                        {item.estimatedCost && item.estimatedCost > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {formatCurrency(item.estimatedCost)}
                          </span>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'passed' ? 'bg-green-500' :
                        item.status === 'minor_issues' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  );
                })}
              </div>

              {/* Section Status Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={(e) => handleFastTrackClick(e, section.id)}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                    sectionStatusInfo.color,
                    sectionStatusInfo.hoverColor
                  )}
                >
                  {sectionStatusInfo.icon}
                  {sectionStatusInfo.label}
                </button>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

// Separate component for detailed view (when clicking on a section)
export const DetailedInspectionView: React.FC<{ sections: InspectionSection[] }> = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getSeverityIcon = (item: InspectionItem) => {
    switch (item.status) {
      case 'passed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'major_issues':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'minor_issues':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.id);
        const hasIssues = section.items.some(item => item.status !== 'passed');
        const totalSectionCost = section.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);

        return (
          <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div className="text-left">
                    <h4 className="font-semibold text-gray-900">{section.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <StatusBadge status={section.status} size="sm" />
                      {totalSectionCost > 0 && (
                        <span className="text-sm text-red-600 font-medium">
                          {formatCurrency(totalSectionCost)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {section.items.length} items
                  </span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            {/* Section Items */}
            {isExpanded && (
              <div className="p-4 bg-white">
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div
                      key={item.id}
                      className={clsx(
                        'flex items-center justify-between p-3 rounded-lg border',
                        item.status === 'passed' ? 'border-green-200 bg-green-50' :
                        item.status === 'minor_issues' ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(item)}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.notes && (
                            <p className="text-sm text-gray-600 mt-1">{item.notes}</p>
                          )}
                          {item.severity && item.status !== 'passed' && (
                            <span className={clsx(
                              'inline-block px-2 py-1 text-xs font-medium rounded-full mt-1',
                              item.severity === 'low' ? 'bg-yellow-100 text-yellow-800' :
                              item.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            )}>
                              {item.severity} severity
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={item.status} size="sm" />
                        {item.estimatedCost && item.estimatedCost > 0 && (
                          <p className="text-sm font-medium text-red-600 mt-1">
                            {formatCurrency(item.estimatedCost)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {hasIssues && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Summary:</strong> This section has{' '}
                      {section.items.filter(item => item.status !== 'passed').length} item(s) requiring attention.
                      {totalSectionCost > 0 && (
                        <> Estimated repair cost: <strong>{formatCurrency(totalSectionCost)}</strong></>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};