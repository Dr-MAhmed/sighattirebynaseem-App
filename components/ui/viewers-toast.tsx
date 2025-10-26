import React from 'react';
import { Eye, Users } from 'lucide-react';

interface ViewersToastProps {
  count: number;
}

export function ViewersToast({ count }: ViewersToastProps) {
  // Don't show if there are no viewers or just 1 (the current user)
  if (count <= 1) return null;
  
  // For development mode, we'll show a more accurate representation
  // In production, this would show the actual count from multiple real users
  const displayCount = count;
  
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-3 rounded-lg shadow-lg">
      <div className="bg-white/20 p-2 rounded-full flex items-center justify-center">
        {displayCount > 5 ? (
          <Users className="h-4 w-4 text-white" />
        ) : (
          <Eye className="h-4 w-4 text-white" />
        )}
      </div>
      <div>
        <p className="font-medium text-sm">
          <span className="font-bold">{displayCount}</span> {displayCount === 1 ? 'person is' : 'people are'} viewing this product
        </p>
        <p className="text-xs text-white/80">right now</p>
      </div>
    </div>
  );
} 