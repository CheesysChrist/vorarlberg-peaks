'use client';

import type { MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { useLogHike, useRemoveHike } from '@/lib/queries';

const difficultyLabel: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-green-600 bg-green-50' },
  moderate: { label: 'Moderate', color: 'text-yellow-700 bg-yellow-50' },
  hard: { label: 'Hard', color: 'text-orange-600 bg-orange-50' },
  expert: { label: 'Expert', color: 'text-red-600 bg-red-50' },
};

interface MountainCardProps {
  mountain: MountainWithHikeStatus;
  selected?: boolean;
  onClick?: () => void;
}

export function MountainCard({ mountain, selected, onClick }: MountainCardProps) {
  const logHike = useLogHike();
  const removeHike = useRemoveHike();
  const diff = mountain.difficulty ? difficultyLabel[mountain.difficulty] : null;

  const toggleHike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mountain.hiked) {
      removeHike.mutate(mountain.id);
    } else {
      logHike.mutate({ mountainId: mountain.id, hikedAt: new Date().toISOString() });
    }
  };

  return (
    <div
      onClick={onClick}
      className={[
        'relative rounded-xl border bg-white p-4 cursor-pointer transition-all hover:shadow-md',
        selected ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500' : 'border-gray-200',
        mountain.hiked ? 'bg-emerald-50/30' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{mountain.name}</h3>
          <p className="text-sm text-gray-500">{mountain.region?.name}</p>
        </div>
        <button
          onClick={toggleHike}
          disabled={logHike.isPending || removeHike.isPending}
          className={[
            'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
            mountain.hiked
              ? 'bg-emerald-500 text-white hover:bg-red-400'
              : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600',
          ].join(' ')}
          title={mountain.hiked ? 'Remove hike' : 'Mark as hiked'}
        >
          {mountain.hiked ? '✓' : '+'}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-700">{mountain.altitude}m</span>
        {diff && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>{diff.label}</span>
        )}
        {mountain.hiked && mountain.hikedAt && (
          <span className="text-xs text-emerald-600">
            {new Date(mountain.hikedAt).toLocaleDateString('de-AT', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
