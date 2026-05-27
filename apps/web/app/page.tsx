'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMountains } from '@/lib/queries';
import { MountainCard } from '@/components/mountains/MountainCard';
import { FilterBar } from '@/components/mountains/FilterBar';
import type { MountainWithHikeStatus } from '@vorarlberg-peaks/types';

const PeaksMap = dynamic(() => import('@/components/map/PeaksMap').then((m) => m.PeaksMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />,
});

export default function DashboardPage() {
  const [selectedMountain, setSelectedMountain] = useState<MountainWithHikeStatus | null>(null);
  const [filters, setFilters] = useState<{ regionId?: string; difficulty?: string; search?: string }>({});

  const { data, isLoading } = useMountains({ ...filters, limit: 200 });
  const mountains = data?.data ?? [];
  const hikedCount = mountains.filter((m) => m.hiked).length;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⛰️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Vorarlberg Peaks</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your mountain log</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          <span className="text-emerald-600 font-semibold">{hikedCount}</span> summits reached
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-96 shrink-0 flex flex-col border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-100">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              totalCount={data?.total ?? 0}
              hikedCount={hikedCount}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading && (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
              ))
            )}
            {mountains.map((mountain) => (
              <MountainCard
                key={mountain.id}
                mountain={mountain}
                selected={selectedMountain?.id === mountain.id}
                onClick={() => setSelectedMountain(mountain)}
              />
            ))}
            {!isLoading && mountains.length === 0 && (
              <p className="text-center text-gray-400 py-12 text-sm">No mountains found</p>
            )}
          </div>
        </aside>

        <main className="flex-1 p-4">
          <PeaksMap
            mountains={mountains}
            onMountainSelect={setSelectedMountain}
          />
        </main>
      </div>
    </div>
  );
}
