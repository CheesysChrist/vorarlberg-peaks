'use client';

import { useState, useEffect } from 'react';
import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { useLogHike, useRemoveHike } from '@/lib/queries';
import { ConfettiBurst } from '@/components/hikes/Confetti';
import { useToast } from '@/lib/toast';
import { t } from '@/lib/i18n';

interface LogHikeModalProps {
  mountain: MountainWithHikeStatus;
  existingHike?: Hike;
  onClose: () => void;
}

const difficultyLabel: Record<string, string> = {
  easy: t.common.difficulty.easy,
  moderate: t.common.difficulty.moderate,
  hard: t.common.difficulty.hard,
  expert: t.common.difficulty.expert,
};

const ratingLabels = t.hikeModal.ratingLabels;

export function LogHikeModal({ mountain, existingHike, onClose }: LogHikeModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const isEdit = !!existingHike;

  const [hikedAt, setHikedAt] = useState(
    existingHike ? existingHike.hikedAt.split('T')[0] : today
  );
  const [rating, setRating] = useState<number | null>(existingHike?.rating ?? null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [notes, setNotes] = useState(existingHike?.notes ?? '');

  const [showConfetti, setShowConfetti] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const logHike = useLogHike();
  const removeHike = useRemoveHike();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logHike.mutate(
      {
        mountainId: mountain.id,
        hikedAt: new Date(hikedAt).toISOString(),
        notes: notes.trim() || undefined,
        rating: rating ?? undefined,
      },
      {
        onSuccess: () => {
          if (!isEdit) {
            toast(`${mountain.name} ${t.hikeModal.toast.summited}`);
            setShowConfetti(true);
          } else {
            toast(t.hikeModal.toast.updated);
            onClose();
          }
        },
        onError: () => toast(t.common.errorGeneric, 'error'),
      }
    );
  };

  const handleRemove = () => {
    removeHike.mutate(mountain.id, {
      onSuccess: () => { toast(t.hikeModal.toast.removed); onClose(); },
      onError: () => toast('Something went wrong', 'error'),
    });
  };

  const displayRating = hoverRating ?? rating ?? 0;
  const isBusy = logHike.isPending || removeHike.isPending;

  return (
    <>
    {showConfetti && <ConfettiBurst onDone={onClose} />}
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {isEdit ? t.hikeModal.editTitle : t.hikeModal.logTitle}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {mountain.name}
                <span className="mx-1">·</span>
                <span>{mountain.altitude}m</span>
                {mountain.difficulty && (
                  <>
                    <span className="mx-1">·</span>
                    <span>{difficultyLabel[mountain.difficulty]}</span>
                  </>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.hikeModal.summitDate}
              </label>
              <input
                type="date"
                value={hikedAt}
                max={today}
                onChange={(e) => setHikedAt(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.hikeModal.rating} <span className="text-gray-400 font-normal">({t.hikeModal.optional})</span>
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? null : star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className={`text-3xl transition-all hover:scale-110 select-none ${
                      star <= displayRating ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
                {displayRating > 0 && (
                  <span className="ml-2 text-sm text-gray-400">{ratingLabels[displayRating]}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.hikeModal.notes} <span className="text-gray-400 font-normal">({t.hikeModal.optional})</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.hikeModal.notesPlaceholder}
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                disabled={isBusy}
                className="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t.common.buttons.cancel}
              </button>
              <button
                type="submit"
                disabled={isBusy}
                className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-60"
              >
                {logHike.isPending ? t.hikeModal.saving : isEdit ? t.common.buttons.saveChanges : `${t.mountain.logSummit} ✓`}
              </button>
            </div>

            {isEdit && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={isBusy}
                className="w-full text-sm text-red-400 hover:text-red-600 py-1.5 transition-colors disabled:opacity-50"
              >
                {removeHike.isPending ? t.hikeModal.removing : t.hikeModal.removeThisHike}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
    </>
  );
}
