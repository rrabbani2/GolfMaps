'use client';

import { BusynessScore } from '@/lib/types';

interface BusyScoreBadgeProps {
  score: BusynessScore;
}

export default function BusyScoreBadge({ score }: BusyScoreBadgeProps) {
  // Validate score data
  if (!score || typeof score.score !== 'number' || !score.label) {
    console.error('Invalid busyness score data:', score);
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-400 text-white">
        <span>Invalid data</span>
      </div>
    );
  }

  const getColorClass = () => {
    if (score.score >= 75) {
      return 'bg-red-100 text-gray-900 border border-red-300';
    } else if (score.score >= 50) {
      return 'bg-orange-100 text-gray-900 border border-orange-300';
    } else if (score.score >= 25) {
      return 'bg-yellow-100 text-gray-900 border border-yellow-300';
    } else {
      return 'bg-green-100 text-gray-900 border border-green-300';
    }
  };

  const colorClass = getColorClass();
  
  return (
    <div 
      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold ${colorClass}`}
      style={{ 
        minWidth: '140px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111827' // Explicit black text
      }}
    >
      <span style={{ fontWeight: 600, color: '#111827' }}>{score.label}</span>
      <span className="ml-2 text-xs font-normal" style={{ opacity: 0.9, color: '#111827' }}>({score.score})</span>
    </div>
  );
}

