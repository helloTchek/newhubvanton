import React from 'react';
import { DamageSeverity } from '../../types/damageReview';

interface VehiclePart {
  id: string;
  name: string;
  location: 'front' | 'rear' | 'left' | 'right' | 'top' | 'center';
  maxSeverity: DamageSeverity;
  damageCount: number;
}

interface VehicleDiagramProps {
  parts: VehiclePart[];
  onPartClick?: (part: VehiclePart) => void;
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
      return '#E5E7EB'; // gray - no damage
  }
}

export function VehicleDiagram({ parts, onPartClick }: VehicleDiagramProps) {
  const getPartSeverity = (partName: string): DamageSeverity => {
    const part = parts.find(p => p.name === partName);
    return part?.maxSeverity || 0;
  };

  const getPartDamageCount = (partName: string): number => {
    const part = parts.find(p => p.name === partName);
    return part?.damageCount || 0;
  };

  const PartRect = ({
    partName,
    x,
    y,
    width,
    height,
    label
  }: {
    partName: string;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }) => {
    const severity = getPartSeverity(partName);
    const damageCount = getPartDamageCount(partName);
    const color = getSeverityColor(severity);
    const part = parts.find(p => p.name === partName);

    if (damageCount === 0) return null;

    return (
      <g
        onClick={() => part && onPartClick?.(part)}
        className="cursor-pointer transition-opacity hover:opacity-80"
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={color}
          stroke="#1F2937"
          strokeWidth="2"
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-white text-xs font-medium pointer-events-none"
          style={{ fontSize: '10px' }}
        >
          {label}
        </text>
        {damageCount > 0 && (
          <circle
            cx={x + width - 12}
            cy={y + 12}
            r="10"
            fill="#1F2937"
            stroke="white"
            strokeWidth="2"
          />
        )}
        {damageCount > 0 && (
          <text
            x={x + width - 12}
            y={y + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-white text-xs font-bold pointer-events-none"
            style={{ fontSize: '9px' }}
          >
            {damageCount}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <svg viewBox="0 0 800 600" className="w-full h-auto">
        {/* Top View */}
        <g>
          <text x="400" y="30" textAnchor="middle" className="fill-gray-700 text-sm font-semibold">
            Top View
          </text>

          {/* Front */}
          <PartRect partName="Front Bumper" x="350" y="50" width="100" height="30" label="Front" />

          {/* Hood */}
          <PartRect partName="Hood" x="350" y="85" width="100" height="60" label="Hood" />

          {/* Windshield */}
          <PartRect partName="Windshield" x="350" y="150" width="100" height="20" label="Wind" />

          {/* Roof */}
          <PartRect partName="Roof" x="350" y="175" width="100" height="80" label="Roof" />

          {/* Rear Window */}
          <PartRect partName="Rear Window" x="350" y="260" width="100" height="20" label="Rear W" />

          {/* Trunk */}
          <PartRect partName="Trunk/Tailgate" x="350" y="285" width="100" height="40" label="Trunk" />

          {/* Rear Bumper */}
          <PartRect partName="Rear Bumper" x="350" y="330" width="100" height="30" label="Rear" />

          {/* Left Side */}
          <PartRect partName="Front Left Fender" x="250" y="85" width="95" height="40" label="L Fender" />
          <PartRect partName="Front Left Door" x="250" y="130" width="95" height="60" label="FL Door" />
          <PartRect partName="Rear Left Door" x="250" y="195" width="95" height="60" label="RL Door" />
          <PartRect partName="Rear Left Quarter Panel" x="250" y="260" width="95" height="65" label="L Quarter" />

          {/* Right Side */}
          <PartRect partName="Front Right Fender" x="455" y="85" width="95" height="40" label="R Fender" />
          <PartRect partName="Front Right Door" x="455" y="130" width="95" height="60" label="FR Door" />
          <PartRect partName="Rear Right Door" x="455" y="195" width="95" height="60" label="RR Door" />
          <PartRect partName="Rear Right Quarter Panel" x="455" y="260" width="95" height="65" label="R Quarter" />
        </g>

        {/* Side View */}
        <g>
          <text x="400" y="420" textAnchor="middle" className="fill-gray-700 text-sm font-semibold">
            Side View
          </text>

          {/* Wheels */}
          <PartRect partName="Front Left Tire" x="250" y="520" width="60" height="60" label="FL Tire" />
          <PartRect partName="Front Right Tire" x="330" y="520" width="60" height="60" label="FR Tire" />
          <PartRect partName="Rear Left Tire" x="410" y="520" width="60" height="60" label="RL Tire" />
          <PartRect partName="Rear Right Tire" x="490" y="520" width="60" height="60" label="RR Tire" />

          {/* Body */}
          <PartRect partName="Rocker Panel Left" x="250" y="450" width="140" height="30" label="L Rocker" />
          <PartRect partName="Rocker Panel Right" x="410" y="450" width="140" height="30" label="R Rocker" />
          <PartRect partName="Grille" x="250" y="485" width="60" height="30" label="Grille" />
        </g>
      </svg>
    </div>
  );
}
