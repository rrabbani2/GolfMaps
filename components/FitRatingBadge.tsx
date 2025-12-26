'use client';

import { FitRating } from '@/lib/types';

interface FitRatingBadgeProps {
  rating: FitRating;
}

export default function FitRatingBadge({ rating }: FitRatingBadgeProps) {
  // Validate rating data
  if (!rating || typeof rating.score !== 'number' || !rating.label) {
    console.error('Invalid fit rating data:', rating);
    return (
      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-400 text-white">
        <span>Invalid data</span>
      </div>
    );
  }

  const getColorClass = () => {
    if (rating.score >= 80) {
      return 'bg-green-100 text-gray-900 border border-green-300';
    } else if (rating.score >= 60) {
      return 'bg-blue-100 text-gray-900 border border-blue-300';
    } else if (rating.score >= 40) {
      return 'bg-yellow-100 text-gray-900 border border-yellow-300';
    } else {
      return 'bg-gray-100 text-gray-900 border border-gray-300';
    }
  };

  const colorClass = getColorClass();
  
  return (
    <div 
      className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold ${colorClass}`}
      style={{ 
        minWidth: '160px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#111827' // Explicit black text
      }}
    >
      <span style={{ fontWeight: 600, color: '#111827' }}>{rating.label} Fit</span>
      <span className="ml-2 text-xs font-normal" style={{ opacity: 0.9, color: '#111827' }}>({rating.score}/100)</span>
    </div>
  );
}

