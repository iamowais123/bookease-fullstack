import React from 'react';
import type { BookingStatus } from '../../types/index.js';

interface BadgeProps {
  status: BookingStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const normalized = status.toLowerCase();

  let styles = 'bg-gray-100 text-gray-700 border-gray-200';

  if (normalized === 'confirmed') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (normalized === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (normalized === 'completed') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (normalized === 'cancelled') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${styles} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          normalized === 'confirmed'
            ? 'bg-emerald-500'
            : normalized === 'pending'
            ? 'bg-amber-500'
            : normalized === 'completed'
            ? 'bg-purple-500'
            : normalized === 'cancelled'
            ? 'bg-rose-500'
            : 'bg-gray-400'
        }`}
      />
      {status}
    </span>
  );
};
