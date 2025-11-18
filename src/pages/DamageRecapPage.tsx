import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { VehicleDiagram } from '../components/recap/VehicleDiagram';
import { DamageReviewService } from '../services/damageReviewService';
import { Damage, DamageSeverity, getSeverityLabel } from '../types/damageReview';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface PartDamageInfo {
  id: string;
  name: string;
  location: 'front' | 'rear' | 'left' | 'right' | 'top' | 'center';
  maxSeverity: DamageSeverity;
  damageCount: number;
  damages: Damage[];
}

export default function DamageRecapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reportId } = useParams<{ reportId: string }>();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [parts, setParts] = useState<PartDamageInfo[]>([]);
  const [selectedPart, setSelectedPart] = useState<PartDamageInfo | null>(null);
  const [allDamages, setAllDamages] = useState<Damage[]>([]);

  useEffect(() => {
    if (reportId) {
      loadRecapData();
    }
  }, [reportId]);

  const loadRecapData = async () => {
    if (!reportId) return;

    try {
      setLoading(true);
      const damages = await DamageReviewService.getDamagesForReport(reportId);

      // Only include validated damages
      const validatedDamages = damages.filter(d => d.status === 'validated');
      setAllDamages(validatedDamages);

      // Group damages by part
      const partMap = new Map<string, Damage[]>();
      validatedDamages.forEach(damage => {
        const key = damage.partName;
        if (!partMap.has(key)) {
          partMap.set(key, []);
        }
        partMap.get(key)!.push(damage);
      });

      // Create part info objects
      const partInfos: PartDamageInfo[] = Array.from(partMap.entries()).map(([partName, damages]) => {
        const maxSeverity = Math.max(...damages.map(d => d.severity)) as DamageSeverity;
        const location = getPartLocation(partName);

        return {
          id: partName,
          name: partName,
          location,
          maxSeverity,
          damageCount: damages.length,
          damages
        };
      });

      setParts(partInfos);
    } catch (error) {
      console.error('Failed to load recap data:', error);
      toast.error('Failed to load damage recap');
    } finally {
      setLoading(false);
    }
  };

  const getPartLocation = (partName: string): 'front' | 'rear' | 'left' | 'right' | 'top' | 'center' => {
    const name = partName.toLowerCase();
    if (name.includes('front') || name.includes('hood') || name.includes('windshield') || name.includes('grille')) {
      return 'front';
    }
    if (name.includes('rear') || name.includes('trunk') || name.includes('tailgate')) {
      return 'rear';
    }
    if (name.includes('left') || name.includes('driver')) {
      return 'left';
    }
    if (name.includes('right') || name.includes('passenger')) {
      return 'right';
    }
    if (name.includes('roof') || name.includes('sunroof')) {
      return 'top';
    }
    return 'center';
  };

  const getLocationLabel = (location: string): string => {
    const labels: Record<string, string> = {
      front: 'Front',
      rear: 'Rear',
      left: 'Left Side',
      right: 'Right Side',
      top: 'Top',
      center: 'Center'
    };
    return labels[location] || location;
  };

  const groupPartsByLocation = () => {
    const groups: Record<string, PartDamageInfo[]> = {
      front: [],
      left: [],
      right: [],
      rear: [],
      top: [],
      center: []
    };

    parts.forEach(part => {
      groups[part.location].push(part);
    });

    return groups;
  };

  const handleConfirmReport = async () => {
    if (!reportId || !user) return;

    setConfirming(true);
    try {
      await DamageReviewService.markReportAsManuallyReviewed(reportId, user.id);
      toast.success('Report confirmed successfully');
      navigate('/');
    } catch (error) {
      console.error('Failed to confirm report:', error);
      toast.error('Failed to confirm report');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading damage recap...</p>
        </div>
      </div>
    );
  }

  const locationGroups = groupPartsByLocation();
  const totalDamages = allDamages.length;
  const totalParts = parts.length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Damage Inspection Recap</h1>
              <p className="text-sm text-gray-600 mt-1">Report ID: {reportId}</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-700">{totalDamages}</div>
              <div className="text-sm text-blue-600">Total Damages</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-700">{totalParts}</div>
              <div className="text-sm text-green-600">Affected Parts</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-700">
                {allDamages.filter(d => d.severity >= 4).length}
              </div>
              <div className="text-sm text-orange-600">Severe Damages</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-700">100%</div>
              <div className="text-sm text-purple-600">Review Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Vehicle Diagram */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Vehicle Damage Overview</h2>
            <VehicleDiagram parts={parts} onPartClick={setSelectedPart} />

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#10B981' }}></div>
                <span className="text-sm text-gray-700">Severity 1 (Very Minor)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#84CC16' }}></div>
                <span className="text-sm text-gray-700">Severity 2 (Minor)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FBBF24' }}></div>
                <span className="text-sm text-gray-700">Severity 3 (Moderate)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#F97316' }}></div>
                <span className="text-sm text-gray-700">Severity 4 (Significant)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                <span className="text-sm text-gray-700">Severity 5 (Severe)</span>
              </div>
            </div>
          </div>

          {/* Damaged Parts by Location */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Damaged Parts by Location</h2>

            {Object.entries(locationGroups).map(([location, locationParts]) => {
              if (locationParts.length === 0) return null;

              return (
                <div key={location} className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Car Body - {getLocationLabel(location)}
                  </h3>
                  <div className="space-y-2">
                    {locationParts.map(part => (
                      <div
                        key={part.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => setSelectedPart(part)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{
                              backgroundColor: getSeverityColor(part.maxSeverity)
                            }}
                          ></div>
                          <div>
                            <div className="font-medium text-gray-900">{part.name}</div>
                            <div className="text-sm text-gray-600">
                              {getSeverityLabel(part.maxSeverity)} - {part.damageCount} damage{part.damageCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Click to view details</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Confirmation Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start gap-4 mb-4">
              <AlertCircle className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Ready to Finalize Report?</h3>
                <p className="text-gray-600 mb-4">
                  By confirming, you acknowledge that all damages have been reviewed and validated.
                  This action will create the final inspection report and mark the vehicle as inspected.
                </p>
                <button
                  onClick={handleConfirmReport}
                  disabled={confirming}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle className="w-5 h-5" />
                  {confirming ? 'Confirming...' : 'Confirm Vehicle Condition & Create Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part Details Modal */}
      {selectedPart && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPart(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{selectedPart.name}</h3>
                <button
                  onClick={() => setSelectedPart(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {selectedPart.damages.map((damage, index) => (
                  <div key={damage.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          Damage #{index + 1}: {damage.damageType}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Location: {damage.location}
                        </div>
                        <div className="text-sm text-gray-600">
                          Severity: {getSeverityLabel(damage.severity)}
                        </div>
                        {damage.notes && (
                          <div className="text-sm text-gray-600 mt-2">
                            Notes: {damage.notes}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-16 h-16 rounded flex-shrink-0 ml-4"
                        style={{
                          backgroundColor: getSeverityColor(damage.severity)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getSeverityColor(severity: DamageSeverity): string {
  switch (severity) {
    case 1:
      return '#10B981'; // green
    case 2:
      return '#84CC16'; // lighter green
    case 3:
      return '#FBBF24'; // yellow
    case 4:
      return '#F97316'; // orange
    case 5:
      return '#EF4444'; // red
    default:
      return '#E5E7EB'; // gray
  }
}
