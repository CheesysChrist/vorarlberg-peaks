'use client';

import { useState } from 'react';
import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { useRemoveHike } from '@/lib/queries';
import { LogHikeModal } from '@/components/hikes/LogHikeModal';
import { useToast } from '@/lib/toast';
import { t } from '@/lib/i18n';

const difficultyLabel: Record<string, { label: string; color: string }> = {
  easy: { label: t.common.difficulty.easy, color: 'text-green-700 bg-green-100' },
  moderate: { label: t.common.difficulty.moderate, color: 'text-yellow-700 bg-yellow-100' },
  hard: { label: t.common.difficulty.hard, color: 'text-orange-700 bg-orange-100' },
  expert: { label: t.common.difficulty.expert, color: 'text-red-700 bg-red-100' },
};

interface MountainDetailPanelProps {
  mountain: MountainWithHikeStatus;
  hike?: Hike;
  onClose: () => void;
}

export function MountainDetailPanel({ mountain, hike, onClose }: MountainDetailPanelProps) {
  const [showModal, setShowModal] = useState(false);
  const removeHike = useRemoveHike();
  const toast = useToast();
  const diff = mountain.difficulty ? difficultyLabel[mountain.difficulty] : null;

  return (
    <>
      <div className="border-t border-gray-200 bg-white flex flex-col" style={{ height: '55%' }}>
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 shrink-0">
          <div className="min-w-0">
            <h2 className="font-bold text-gray-900 text-base leading-tight truncate">
              {mountain.name}
            </h2>
            {mountain.nameDe && mountain.nameDe !== mountain.name && (
              <p className="text-xs text-gray-400 mt-0.5">{mountain.nameDe}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 ml-2 text-gray-400 hover:text-gray-600 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Image */}
        {mountain.imageUrl && (
          <div className="mx-4 mb-3 rounded-xl overflow-hidden h-28 shrink-0">
            <img
              src={mountain.imageUrl}
              alt={mountain.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">{mountain.altitude}m</span>
            {diff && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${diff.color}`}>
                {diff.label}
              </span>
            )}
            {mountain.region?.name && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {mountain.region.name}
              </span>
            )}
          </div>

          {/* Description */}
          {mountain.description && (
            <p className="text-sm text-gray-600 leading-relaxed">{mountain.description}</p>
          )}

          {/* Route notes */}
          {mountain.routeNotes && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-3 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{t.mountain.routeNotes}</p>
              <p className="text-sm leading-relaxed text-gray-700">{mountain.routeNotes}</p>
            </div>
          )}

          {/* Hike details */}
          {mountain.hiked && (
            <div className="bg-emerald-50 rounded-xl p-3 space-y-1.5 border border-emerald-100">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                {t.mountain.yourSummit}
              </p>
              {mountain.hikedAt && (
                <p className="text-sm text-gray-700">
                  {new Date(mountain.hikedAt).toLocaleDateString('de-AT', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              )}
              {hike?.rating && (
                <p className="text-amber-400 text-base leading-none">
                  {'★'.repeat(hike.rating)}
                  <span className="text-gray-300">{'★'.repeat(5 - hike.rating)}</span>
                </p>
              )}
              {hike?.notes && (
                <p className="text-sm text-gray-600 italic">"{hike.notes}"</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {mountain.hiked ? (
              <>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex-1 bg-emerald-500 text-white rounded-xl py-2 text-sm font-semibold hover:bg-emerald-600 transition-colors"
                >
                  {t.mountain.editSummit}
                </button>
                <button
                  onClick={() => removeHike.mutate(mountain.id, {
                    onSuccess: () => toast(t.hikeModal.toast.removed),
                    onError: () => toast(t.common.errorGeneric, 'error'),
                  })}
                  disabled={removeHike.isPending}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-red-400 hover:text-red-600 hover:border-red-200 text-sm transition-colors disabled:opacity-50"
                  title={t.mountain.removeHike}
                >
                  ✕
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowModal(true)}
                className="flex-1 bg-gray-900 text-white rounded-xl py-2 text-sm font-semibold hover:bg-gray-700 transition-colors"
              >
                {t.mountain.logSummit}
              </button>
            )}
          </div>
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
