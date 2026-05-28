'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useMountains, useHikes } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { MountainCard } from '@/components/mountains/MountainCard';
import { FilterBar } from '@/components/mountains/FilterBar';
import { MountainDetailPanel } from '@/components/mountains/MountainDetailPanel';
import { AuthModal } from '@/components/auth/AuthModal';
import { AchievementsView } from '@/components/gamification/AchievementsView';
import type { MountainWithHikeStatus } from '@vorarlberg-peaks/types';

const PeaksMap = dynamic(() => import('@/components/map/PeaksMap').then((m) => m.PeaksMap), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl" />,
});

type SidebarTab = 'peaks' | 'achievements';
type SortKey = 'altitude_desc' | 'altitude_asc' | 'name_asc' | 'hiked_desc';

function sortMountains(mountains: MountainWithHikeStatus[], sort: SortKey): MountainWithHikeStatus[] {
  return [...mountains].sort((a, b) => {
    switch (sort) {
      case 'altitude_asc':  return a.altitude - b.altitude;
      case 'name_asc':      return a.name.localeCompare(b.name);
      case 'hiked_desc':    return (b.hikedAt ?? '').localeCompare(a.hikedAt ?? '');
      default:              return b.altitude - a.altitude; // altitude_desc
    }
  });
}

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [selectedMountain, setSelectedMountain] = useState<MountainWithHikeStatus | null>(null);
  const [filters, setFilters] = useState<{ regionId?: string; difficulty?: string; search?: string; hiked?: boolean }>({});
  const [activeTab, setActiveTab] = useState<SidebarTab>('peaks');
  const [sortKey, setSortKey] = useState<SortKey>('altitude_desc');

  const { data, isLoading } = useMountains({ ...filters, limit: 200 });
  const { data: globalStats } = useMountains({ limit: 1 });
  const { data: hikes } = useHikes(isAuthenticated);
  const mountains = sortMountains(data?.data ?? [], sortKey);
  const totalHikedCount = hikes?.length ?? 0;
  const totalCount = globalStats?.total ?? data?.total ?? 0;

  // Build a fast lookup from mountainId → full Hike (for notes/rating)
  const hikesMap = new Map((hikes ?? []).map((h) => [h.mountainId, h]));

  // Always derive from the live mountains list so it reflects post-mutation state
  const resolvedSelected = selectedMountain
    ? (mountains.find((m) => m.id === selectedMountain.id) ?? selectedMountain)
    : null;

  const handleMountainSelect = (mountain: MountainWithHikeStatus) => {
    setSelectedMountain((prev) => (prev?.id === mountain.id ? null : mountain));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {!isAuthenticated && <AuthModal />}

      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⛰️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-none">Vorarlberg Peaks</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your mountain log</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <span className="text-emerald-600 font-semibold">{totalHikedCount}</span> summits reached
          </div>
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{user?.username}</span>
              <button
                onClick={logout}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-96 shrink-0 flex flex-col border-r border-gray-200 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 shrink-0">
            <TabButton active={activeTab === 'peaks'} onClick={() => setActiveTab('peaks')}>
              Peaks
            </TabButton>
            <TabButton active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')}>
              Achievements
              {totalHikedCount > 0 && (
                <span className="ml-1.5 text-xs bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-medium tabular-nums">
                  {totalHikedCount}
                </span>
              )}
            </TabButton>
          </div>

          {activeTab === 'peaks' ? (
            <>
              <div className="p-4 border-b border-gray-100 shrink-0">
                <FilterBar
                  filters={filters}
                  onChange={setFilters}
                  totalCount={totalCount}
                  hikedCount={totalHikedCount}
                />
              </div>

              {/* Sort bar */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
                <span className="text-xs text-gray-400">{mountains.length} peaks</span>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="text-xs text-gray-500 border-0 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="altitude_desc">Altitude ↓</option>
                  <option value="altitude_asc">Altitude ↑</option>
                  <option value="name_asc">Name A–Z</option>
                  <option value="hiked_desc">Recently hiked</option>
                </select>
              </div>

              {/* Mountain list — shrinks when detail panel is open */}
              <div
                className="overflow-y-auto p-4 space-y-2"
                style={{ flex: resolvedSelected ? '0 0 45%' : '1 1 0' }}
              >
                {isLoading &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                  ))}
                {mountains.map((mountain) => (
                  <MountainCard
                    key={mountain.id}
                    mountain={mountain}
                    hike={hikesMap.get(mountain.id)}
                    selected={selectedMountain?.id === mountain.id}
                    onClick={() => handleMountainSelect(mountain)}
                  />
                ))}
                {!isLoading && mountains.length === 0 && (
                  <p className="text-center text-gray-400 py-12 text-sm">No mountains found</p>
                )}
              </div>

              {/* Detail panel — appears below list when a mountain is selected */}
              {resolvedSelected && (
                <MountainDetailPanel
                  mountain={resolvedSelected}
                  hike={hikesMap.get(resolvedSelected.id)}
                  onClose={() => setSelectedMountain(null)}
                />
              )}
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <AchievementsView
                hikes={hikes ?? []}
                mountains={mountains}
                totalCount={totalCount}
              />
            </div>
          )}
        </aside>

        <main className="flex-1 p-4">
          <PeaksMap mountains={mountains} onMountainSelect={handleMountainSelect} />
        </main>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 flex items-center justify-center gap-1 px-4 py-3 text-sm font-medium transition-colors',
        active
          ? 'text-emerald-600 border-b-2 border-emerald-500'
          : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
