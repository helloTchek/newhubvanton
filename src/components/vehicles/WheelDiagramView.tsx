import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import clsx from 'clsx';

interface WheelData {
  position: 'front-left' | 'front-right' | 'rear-left' | 'rear-right';
  imageUrl: string;
  confidence: string;
  damaged: boolean;
  damageType?: string;
  rimType?: string;
  material?: string;
  size?: string;
  brand?: string;
  dot?: string;
}

interface WheelDiagramViewProps {
  type: 'rim' | 'tire';
  wheels: WheelData[];
}

export const WheelDiagramView: React.FC<WheelDiagramViewProps> = ({ type, wheels }) => {
  const getWheelByPosition = (position: WheelData['position']) => {
    return wheels.find(w => w.position === position);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const WheelCard: React.FC<{ wheel: WheelData }> = ({ wheel }) => (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-all shadow-sm hover:shadow-md">
      <div className="relative">
        <img
          src={wheel.imageUrl}
          alt={`${type} ${wheel.position}`}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
          {wheel.confidence}
        </div>
        {wheel.damaged && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1 text-xs font-medium">
            <AlertTriangle className="w-3 h-3" />
            Damaged
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3 capitalize">
          {wheel.position.replace('-', ' ')}
        </h3>
        <div className="space-y-2 text-sm">
          {type === 'rim' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Material:</span>
                <span className="font-medium text-gray-900">{wheel.material || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium text-gray-900">{wheel.rimType || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">{wheel.size || 'N/A'}</span>
              </div>
              {wheel.damaged && wheel.damageType && (
                <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                  <span className="text-red-600 font-medium">Damage:</span>
                  <span className="text-red-600 text-right">{wheel.damageType}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand:</span>
                <span className="font-medium text-gray-900">{wheel.brand || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium text-gray-900">{wheel.size || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">DOT:</span>
                <span className="font-medium text-gray-900">{wheel.dot || 'N/A'}</span>
              </div>
              {wheel.damaged && wheel.damageType && (
                <div className="flex justify-between items-start pt-2 border-t border-gray-200">
                  <span className="text-red-600 font-medium">Damage:</span>
                  <span className="text-red-600 text-right">{wheel.damageType}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className={clsx(
          "mt-3 pt-3 border-t border-gray-200 flex items-center gap-2",
          wheel.damaged ? "text-red-600" : "text-green-600"
        )}>
          {wheel.damaged ? (
            <>
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Needs attention</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Good condition</span>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const frontLeft = getWheelByPosition('front-left');
  const frontRight = getWheelByPosition('front-right');
  const rearLeft = getWheelByPosition('rear-left');
  const rearRight = getWheelByPosition('rear-right');

  return (
    <div className="space-y-8">
      {/* Car Diagram View */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
          Vehicle {type === 'rim' ? 'Rims' : 'Tires'} Overview
        </h3>

        <div className="relative max-w-6xl mx-auto">
          {/* Grid Layout with 3 columns: Left wheels, Car image, Right wheels */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-8 items-center">
            {/* Left Side - Front Left & Rear Left */}
            <div className="space-y-8">
              {frontLeft && <WheelCard wheel={frontLeft} />}
              {rearLeft && <WheelCard wheel={rearLeft} />}
            </div>

            {/* Center - Car Diagram rotated 180 degrees */}
            <div className="w-64 relative">
              <img
                src="/ChatGPT Image 1 oct. 2025, 16_43_27.png"
                alt="Car top view"
                className="w-full h-auto transform rotate-180"
              />
            </div>

            {/* Right Side - Front Right & Rear Right */}
            <div className="space-y-8">
              {frontRight && <WheelCard wheel={frontRight} />}
              {rearRight && <WheelCard wheel={rearRight} />}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total {type === 'rim' ? 'Rims' : 'Tires'}</p>
              <p className="text-2xl font-bold text-gray-900">{wheels.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Good Condition</p>
              <p className="text-2xl font-bold text-gray-900">
                {wheels.filter(w => !w.damaged).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Damaged</p>
              <p className="text-2xl font-bold text-gray-900">
                {wheels.filter(w => w.damaged).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
