'use client';

import { useState } from 'react';
import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { LogHikeModal } from '@/components/hikes/LogHikeModal';
import { t } from '@/lib/i18n';

const difficultyLabel: Record<string, { label: string; color: string }> = {
  easy: { label: t.common.difficulty.easy, color: 'text-green-600 bg-green-50' },
  moderate: { label: t.common.difficulty.moderate, color: 'text-yellow-700 bg-yellow-50' },
  hard: { label: t.common.difficulty.hard, color: 'text-orange-600 bg-orange-50' },
  expert: { label: t.common.difficulty.expert, color: 'text-red-600 bg-red-50' },
};

interface MountainCardProps {
  mountain: MountainWithHikeStatus;
  hike?: Hike;
  selected?: boolean;
  onClick?: () => void;
}

export function MountainCard({ mountain, hike, selected, onClick }: MountainCardProps) {
  const [showModal, setShowModal] = useState(false);
  const diff = mountain.difficulty ? difficultyLabel[mountain.difficulty] : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  return (
    <>
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
            onClick={handleToggle}
            className={[
              'shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
              mountain.hiked
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-100 text-gray-400 hover:bg-emerald-100 hover:text-emerald-600',
            ].join(' ')}
            title={mountain.hiked ? t.mountain.editSummit : t.mountain.logSummit}
          >
            {mountain.hiked ? '✓' : '+'}
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">{mountain.altitude}m</span>
          {diff && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>
              {diff.label}
            </span>
          )}
          {mountain.hiked && mountain.hikedAt && (
            <span className="text-xs text-emerald-600">
              {new Date(mountain.hikedAt).toLocaleDateString('de-AT', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          )}
          {hike?.rating && (
            <span className="text-xs text-amber-500">{'★'.repeat(hike.rating)}</span>
          )}
        </div>
      </div>

      {showModal && (
        <LogHikeModal
          mountain={mountain}
          existingHike={mountain.hiked ? hike : undefined}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
