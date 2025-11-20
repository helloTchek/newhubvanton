import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  FileSearch,
  Share2
} from 'lucide-react';
import { VehicleInspectionReport, LoadingState } from '../../types';
import { vehicleService } from '../../services/vehicleService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { StatusBadge } from '../common/StatusBadge';
import { InspectionOverviewGrid } from './InspectionOverviewGrid';
import { SectionDetailView } from './SectionDetailView';
import { ShareReportModal } from './ShareReportModal';
import { shareService } from '../../services/shareService';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export const VehicleReportView: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [report, setReport] = useState<VehicleInspectionReport | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: true, error: null });
  const [activeTab, setActiveTab] = useState('estimations');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mainSidebarCollapsed, setMainSidebarCollapsed] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Listen for main sidebar state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
      setMainSidebarCollapsed(collapsed);
    };

    // Initial check
    handleStorageChange();

    // Listen for changes
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sidebarToggle', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebarToggle', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (vehicleId) {
      loadReport(vehicleId);
    }
  }, [vehicleId]);

  useEffect(() => {
    const sectionParam = searchParams.get('section');
    if (sectionParam && report) {
      setSelectedSection(sectionParam);
      setActiveTab('estimations');
    }
  }, [searchParams, report]);

  const loadReport = async (id: string) => {
    try {
      setLoading({ isLoading: true, error: null });
      const response = await vehicleService.getVehicleReport(id);
      setReport(response.data);
    } catch (error: unknown) {
      const errorMessage = error.message || 'Failed to load vehicle report';
      setLoading({ isLoading: false, error: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, isLoading: false }));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSectionClick = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleBackToOverview = () => {
    setSelectedSection(null);
  };

  const handleFastTrackClick = (sectionId: string) => {
    // TODO: Implement fast track functionality
    console.log('Fast track clicked for section:', sectionId);
    toast.success(`Fast track initiated for section: ${sectionId}`);
  };

  const handleValidateAllClick = () => {
    // TODO: Implement validate all functionality
    console.log('Validate all sections clicked');
    toast.success('Validating all sections...');
  };

  const handleDamageReviewClick = () => {
    if (report?.id) {
      navigate(`/damage-review/${report.id}`);
    }
  };

  const handleShareClick = () => {
    if (report?.id) {
      setIsShareModalOpen(true);
    } else {
      toast.error('No report available to share');
    }
  };

  const handleShareSubmit = async (recipients: string[], message?: string) => {
    if (!report?.id || !vehicleId) {
      toast.error('No report selected');
      return;
    }

    try {
      await shareService.shareReport({
        reportId: report.id,
        vehicleId: vehicleId,
        sharedTo: recipients,
        message
      });
      toast.success('Report shared successfully');
      await loadReport(vehicleId);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to share report';
      toast.error(errorMessage);
      throw error;
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'minor_issues':
        return 'bg-yellow-500';
      case 'major_issues':
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return { text: 'Good', color: 'text-green-600' };
      case 'minor_issues':
        return { text: 'Warning', color: 'text-yellow-600' };
      case 'major_issues':
        return { text: 'Critical', color: 'text-red-600' };
      case 'failed':
        return { text: 'Critical', color: 'text-red-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };

  const getSectionStatusInfoForSidebar = (sectionStatus: SectionStatus) => {
    switch (sectionStatus) {
      case 'missing_data':
        return { text: 'Missing Data', color: 'text-red-600', bgColor: 'bg-red-50' };
      case 'needs_review':
        return { text: 'Needs Review', color: 'text-orange-600', bgColor: 'bg-orange-50' };
      case 'reviewed':
        return { text: 'Reviewed', color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'inspect':
        return { text: 'Inspect', color: 'text-blue-600', bgColor: 'bg-blue-50' };
      default:
        return { text: 'Unknown', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const getSelectedSectionData = () => {
    if (!selectedSection || !report) return null;
    
    // Handle vehicle info section specially
    if (selectedSection === 'vehicle-info') {
      return {
        id: 'vehicle-info',
        name: 'Vehicle Information',
        status: 'passed' as InspectionStatus,
        icon: 'ℹ️',
        items: []
      };
    }
    
    return report.inspectionOverview.find(section => section.id === selectedSection);
  };

  if (loading.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading vehicle report..." />
      </div>
    );
  }

  if (loading.error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{loading.error || 'Report not found'}</p>
        <button
          onClick={() => navigate('/vehicles')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'estimations', label: 'Estimations' },
    { id: 'suivi', label: 'Suivi' },
    { id: 'photos', label: 'Photos' }
  ];

  // If a section is selected, show the detailed view with sidebar
  if (selectedSection && activeTab === 'estimations') {
    const sectionData = getSelectedSectionData();
    if (!sectionData) {
      setSelectedSection(null);
      return null;
    }

    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-gray-50">
        {/* Sidebar */}
        <div className={clsx(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20",
          sidebarCollapsed ? "w-16" : "w-80"
        )}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed && (
                <button
                  onClick={handleBackToOverview}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Dashboard
                </button>
              )}
              <button
                onClick={toggleSidebar}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-auto"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold text-gray-900">Sections</h2>
            )}
          </div>

          {/* Vehicle Summary */}
          {!sidebarCollapsed && (
            <div 
              className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelectedSection('vehicle-info')}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={report.vehicle.imageUrl}
                  alt={`${report.vehicle.make} ${report.vehicle.model}`}
                  className="w-16 h-12 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {report.vehicle.registration} • {report.vehicle.mileage.toLocaleString()} km
                  </p>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total estimé</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(report.totalCost)}
                </p>
              </div>
            </div>
          )}

          {/* Section Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className={clsx("p-2", sidebarCollapsed && "px-1")}>
              {/* All Sections - ensure all sections are displayed */}
              {report.inspectionOverview.filter(section => section.isVisible && section.id !== 'vehicle-info').map((section) => {
                const handleSectionFastTrack = (e: React.MouseEvent, sectionId: string) => {
                  e.stopPropagation();
                  handleFastTrackClick(sectionId);
                };

                const sectionCost = section.items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
                const damagedItems = section.items.filter(item => item.status !== 'passed');
                const statusInfo2 = getSectionStatusInfoForSidebar(section.sectionStatus);

                return (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={clsx(
                      'w-full flex items-center rounded-lg text-left transition-colors mb-1',
                      sidebarCollapsed ? 'p-2 justify-center' : 'gap-3 p-3',
                      selectedSection === section.id
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                    title={sidebarCollapsed ? section.name : undefined}
                  >
                    <div className={clsx(
                      "bg-gray-100 rounded-full flex items-center justify-center",
                      sidebarCollapsed ? "w-8 h-8" : "w-6 h-6"
                    )}>
                      <span className="text-xs">{section.icon}</span>
                    </div>
                    {!sidebarCollapsed && (
                      <>
                        <div className="flex-1">
                          <p className="font-medium">{section.name}</p>
                          {damagedItems.length > 0 ? (
                            <div className="text-xs">
                              <p className="text-red-600 font-medium">
                                {damagedItems.length} elements
                              </p>
                              {sectionCost > 0 && (
                                <p className="text-red-600 font-medium">
                                  {formatCurrency(sectionCost)}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-green-600 font-medium">
                              All elements OK
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <button
                            onClick={(e) => handleSectionFastTrack(e, section.id)}
                            className={clsx(
                              'px-2 py-1 rounded text-xs font-medium transition-colors',
                              statusInfo2.color,
                              statusInfo2.bgColor,
                              'hover:opacity-80'
                            )}
                          >
                            {statusInfo2.text}
                          </button>
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
        <div className="flex-1 min-w-0 overflow-y-auto">
          <SectionDetailView
            section={sectionData}
            vehicle={report.vehicle}
            isVehicleInfo={selectedSection === 'vehicle-info'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header with Return Button */}
      <div className="mb-4 sm:mb-6 relative z-10">
        <Link
          to="/vehicles"
          className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm transition-colors hover:underline font-medium inline-flex"
        >
          <ArrowLeft className="w-4 h-4" />
          Return
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'py-2 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
          
          {/* Action Buttons - only show on estimations tab */}
          {activeTab === 'estimations' && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {(report.vehicle.status === 'inspected' || report.vehicle.status === 'to_review') && (
                <button
                  onClick={handleShareClick}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share Report</span>
                  <span className="sm:hidden">Share</span>
                </button>
              )}
              <button
                onClick={handleDamageReviewClick}
                className="bg-orange-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <FileSearch className="w-4 h-4" />
                <span className="hidden sm:inline">Review Damages</span>
                <span className="sm:hidden">Review</span>
              </button>
              <button
                onClick={handleValidateAllClick}
                className="bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Validate All</span>
                <span className="sm:hidden">Validate</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Vehicle Info Card */}
      {activeTab === 'estimations' && (
        <div
          className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
          onClick={() => handleSectionClick('vehicle-info')}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Information</h3>
            <div className="flex items-center gap-2">
              <StatusBadge status="passed" size="sm" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFastTrackClick('vehicle-info');
                }}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors"
              >
                Reviewed
              </button>
            </div>
          </div>
          <div className="flex items-start gap-6">
            {/* Vehicle Image */}
            <img
              src={report.vehicle.imageUrl}
              alt={`${report.vehicle.make} ${report.vehicle.model}`}
              className="w-32 h-24 object-cover rounded-lg flex-shrink-0"
            />
            
            {/* Vehicle Details */}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{report.vehicle.registration}</span> • {report.vehicle.mileage.toLocaleString()} km • Diesel
                </div>
              </div>
            </div>
            
            {/* Cost Estimate */}
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(report.totalCost)}
              </div>
              <div className="text-sm text-gray-500">Coût total estimé</div>
            </div>
          </div>
        </div>
      )}

      {/* Report Metadata Card */}
      {activeTab === 'estimations' && (
        <div
          className="bg-white rounded-lg border border-gray-200 p-6 cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all duration-200"
          onClick={() => setActiveTab('suivi')}
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">{formatDateTime(report.reportDate)}</span>
            {report.vehicle.sharedReport && (
              <div className="ml-auto flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full border border-green-200">
                <Share2 className="w-3 h-3" />
                <span>Report Shared</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm mb-4">
            <div>
              <p className="font-medium text-gray-900 mb-1">Report ID</p>
              <p className="text-gray-600">{report.tchekId}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">Tchek ID</p>
              <p className="text-gray-600">{report.id}</p>
            </div>
          </div>
          {report.vehicle.sharedReport && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900 mb-1">Shared Information</p>
              <div className="text-xs text-green-700 space-y-1">
                <p>Shared by: {report.vehicle.sharedReport.sharedByName}</p>
                <p>Shared on: {new Date(report.vehicle.sharedReport.sharedAt).toLocaleString()}</p>
                <p>Recipients: {report.vehicle.sharedReport.sharedTo.join(', ')}</p>
                {report.vehicle.sharedReport.message && (
                  <p className="mt-2 italic">"{report.vehicle.sharedReport.message}"</p>
                )}
              </div>
            </div>
          )}
          <div className="text-blue-600 text-sm font-medium">
            Cliquez pour voir le suivi →
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'estimations' && (
        <InspectionOverviewGrid 
          sections={report.inspectionOverview.filter(section => section.id !== 'vehicle-info')} 
          onSectionClick={handleSectionClick}
          onFastTrackClick={handleFastTrackClick}
          onValidateAllClick={handleValidateAllClick}
        />
      )}

      {activeTab === 'suivi' && (
        <div className="space-y-6">
          {/* Current Inspection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Inspection Actuelle</h3>
            
            {/* Client Information */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-3">Informations client</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Email inspecteur: {report.inspector.email}</p>
                <p>Email utilisateur final: {report.customer.email}</p>
                <p>Nom utilisateur final: {report.customer.name}</p>
              </div>
            </div>

            {/* Inspection Status */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Statut de l'inspection</h4>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-green-700 font-medium">Inspection terminée</span>
              </div>
              <p className="text-sm text-gray-600">
                Rapport généré le {formatDateTime(report.reportDate)}
              </p>
            </div>
          </div>

          {/* Inspection History */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Historique des Inspections</h3>
            
            <div className="space-y-4">
              {/* Current Inspection */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Inspection #{report.tchekId}</h4>
                      <p className="text-sm text-gray-600">{formatDateTime(report.reportDate)}</p>
                      <p className="text-sm text-gray-600 mt-1">Inspecteur: {report.inspector.email}</p>
                      <p className="text-sm text-gray-600">Tchek ID: {report.id}</p>
                      <p className="text-sm text-gray-600">Photos prises le: {formatDateTime(report.photosDate)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                      Actuelle
                    </span>
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {formatCurrency(report.totalCost)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Inspection */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 bg-gray-400 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-gray-900">Inspection #T722156</h4>
                      <p className="text-sm text-gray-600">15/06/2025 10:23 (UTC)</p>
                      <p className="text-sm text-gray-600 mt-1">Inspecteur: marie.dupont@tchek.ai</p>
                      <p className="text-sm text-gray-600">Tchek ID: 5kLmNpQ32Y</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                      Terminée
                    </span>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      850,00 €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center py-12">
            <p className="text-gray-600">Photos feature coming soon</p>
          </div>
        </div>
      )}

      {report && (
        <ShareReportModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={handleShareSubmit}
          vehicleRegistration={report.vehicle.registration}
        />
      )}
    </div>
  );
};