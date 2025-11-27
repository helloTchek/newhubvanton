import React, { useEffect, useState } from 'react';
import { X, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { Vehicle } from '../../types';
import { vehicleService } from '../../services/vehicleService';
import { StatusBadge } from '../common/StatusBadge';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface InspectionReport {
  id: string;
  vehicle_id: string;
  tchek_id: string;
  report_date: string;
  total_cost: string;
  report_status: string;
  vehicle: {
    id: string;
    registration: string;
    vin: string;
    make: string;
    model: string;
    mileage: number;
    status: string;
    inspection_date: string;
    inspection_type: string;
    images: string[];
    tchek_id: string;
  };
}

interface InspectionDateSelectorProps {
  vehicle: Vehicle;
  onClose: () => void;
  onSelectInspection: (vehicleId: string) => void;
}

export const InspectionDateSelector: React.FC<InspectionDateSelectorProps> = ({
  vehicle,
  onClose,
  onSelectInspection,
}) => {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState<InspectionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInspections();
  }, [vehicle.id]);

  const loadInspections = async () => {
    try {
      setIsLoading(true);
      const response = await vehicleService.getVehicleInspections(vehicle.id);
      setInspections(response.data);
    } catch (error) {
      console.error('Failed to load inspections:', error);
      toast.error('Failed to load other inspections');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectInspection = (report: InspectionReport) => {
    onSelectInspection(report.vehicle.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Inspection History</h2>
              <p className="text-sm text-gray-600 mt-1">
                {vehicle.registration} {vehicle.vin && `(VIN: ${vehicle.vin})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-blue-900">Latest Inspection</span>
                  <StatusBadge status={vehicle.status} />
                </div>
                <div className="text-sm text-blue-800">
                  <span className="font-medium">Date:</span> {formatDateTime(vehicle.inspectionDate || new Date().toISOString())}
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No other inspections found for this vehicle</p>
              <p className="text-sm text-gray-400 mt-1">
                This is the only inspection recorded
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Previous Inspections ({inspections.length})
              </h3>
              {inspections.map((report) => (
                <div
                  key={report.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  onClick={() => handleSelectInspection(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusBadge status={report.vehicle.status as any} />
                        <span className="text-xs text-gray-500">
                          ID: {report.tchek_id}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">Inspection Date:</span> {formatDateTime(report.report_date)}
                      </div>
                      {report.total_cost && parseFloat(report.total_cost) > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Cost:</span> €{parseFloat(report.total_cost).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
