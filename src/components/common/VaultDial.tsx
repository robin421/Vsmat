import React from 'react';

/** Combination-dial ornament: the one decorative motif in the product. */
export const VaultDial: React.FC<{ className?: string }> = ({ className = '' }) => {
  const ticks = Array.from({ length: 60 }, (_, i) => i * 6);
  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden className={`pointer-events-none ${className}`}>
      <circle cx="200" cy="200" r="196" strokeWidth="2" />
      <circle cx="200" cy="200" r="150" strokeWidth="14" />
      <circle cx="200" cy="200" r="86" strokeWidth="2" />
      <circle cx="200" cy="200" r="36" strokeWidth="10" />
      {ticks.map((deg) => (
        <line
          key={deg}
          x1="200"
          y1="10"
          x2="200"
          y2={deg % 30 === 0 ? 34 : 22}
          strokeWidth={deg % 30 === 0 ? 4 : 2}
          transform={`rotate(${deg} 200 200)`}
        />
      ))}
    </svg>
  );
};
