import React from 'react';

interface TiresColumnProps {
  tiresDamaged: {
    frontLeft: boolean;
    frontRight: boolean;
    rearLeft: boolean;
    rearRight: boolean;
  };
}

export const TiresColumn: React.FC<TiresColumnProps> = ({ tiresDamaged }) => {
  const hasDamage = Object.values(tiresDamaged).some(damaged => damaged);

  return (
    <div className="flex items-center justify-center">
      <svg
        width="80"
        height="120"
        viewBox="0 0 80 120"
        className="transform"
      >
        <rect
          x="15"
          y="20"
          width="50"
          height="80"
          rx="8"
          fill="#4B5563"
          className="opacity-20"
        />

        <ellipse
          cx="18"
          cy="30"
          rx="8"
          ry="12"
          fill={tiresDamaged.frontLeft ? '#EF4444' : '#6B7280'}
          className={tiresDamaged.frontLeft ? 'opacity-90' : 'opacity-40'}
        />

        <ellipse
          cx="62"
          cy="30"
          rx="8"
          ry="12"
          fill={tiresDamaged.frontRight ? '#EF4444' : '#6B7280'}
          className={tiresDamaged.frontRight ? 'opacity-90' : 'opacity-40'}
        />

        <ellipse
          cx="18"
          cy="90"
          rx="8"
          ry="12"
          fill={tiresDamaged.rearLeft ? '#EF4444' : '#6B7280'}
          className={tiresDamaged.rearLeft ? 'opacity-90' : 'opacity-40'}
        />

        <ellipse
          cx="62"
          cy="90"
          rx="8"
          ry="12"
          fill={tiresDamaged.rearRight ? '#EF4444' : '#6B7280'}
          className={tiresDamaged.rearRight ? 'opacity-90' : 'opacity-40'}
        />

        <line
          x1="25"
          y1="15"
          x2="55"
          y2="15"
          stroke="#4B5563"
          strokeWidth="3"
          opacity="0.3"
        />
      </svg>

      {!hasDamage && (
        <span className="text-xs text-gray-400 ml-2">No damage</span>
      )}
    </div>
  );
};
