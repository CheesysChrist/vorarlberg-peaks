'use client';

import type { Hike, MountainWithHikeStatus } from '@vorarlberg-peaks/types';
import { computeStats, computeAchievements } from '@/lib/achievements';
import { useLeaderboard, useAchievements } from '@/lib/queries';
import { useAuth } from '@/lib/auth';
import { t } from '@/lib/i18n';

interface AchievementsViewProps {
  hikes: Hike[];
  mountains: MountainWithHikeStatus[];
}

export function AchievementsView({ hikes, mountains }: AchievementsViewProps) {
  const { isAuthenticated } = useAuth();
  const { data: leaderboard } = useLeaderboard();
  const { data: persistedAchievements } = useAchievements(isAuthenticated);
  const stats = computeStats(hikes, mountains);

  const computed = computeAchievements(hikes, mountains);
  const unlockedKeys = new Set<string>((persistedAchievements ?? []).map((a) => a.key));
  const achievements = computed.map((a) =>
    isAuthenticated && persistedAchievements
      ? { ...a, unlocked: unlockedKeys.has(a.id) }
      : a,
  );

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const sorted = [...achievements].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));

  // Per-region completion, sorted by % descending then name
  const regionProgress = Object.entries(
    mountains.reduce<Record<string, { name: string; total: number; hiked: number }>>(
      (acc, m) => {
        const key = m.regionId;
        if (!acc[key]) acc[key] = { name: m.region?.name ?? key, total: 0, hiked: 0 };
        acc[key].total++;
        if (m.hiked) acc[key].hiked++;
        return acc;
      },
      {}
    )
  )
    .map(([regionId, data]) => ({ regionId, ...data }))
    .sort(
      (a, b) =>
        b.hiked / b.total - a.hiked / a.total || a.name.localeCompare(b.name)
    );

  const levelProgress =
    stats.level.nextAt != null
      ? ((stats.totalSummits - stats.level.currentMin) /
          (stats.level.nextAt - stats.level.currentMin)) *
        100
      : 100;

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      {/* Level card */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-xs font-medium uppercase tracking-widest">
              Stufe {stats.level.number}
            </p>
            <h2 className="text-2xl font-bold mt-1">{stats.level.title}</h2>
          </div>
          <div className="text-5xl select-none">⛰️</div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-emerald-100">
            <span>{stats.totalSummits} {t.achievements.level.summitsUnit}</span>
            {stats.level.nextAt != null ? (
              <span>noch {stats.level.nextAt - stats.totalSummits} {t.achievements.level.toNextLevel}</span>
            ) : (
              <span>{t.achievements.level.maxLevel}</span>
            )}
          </div>
          <div className="h-2 bg-emerald-400/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${Math.min(levelProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      {leaderboard && leaderboard.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {t.achievements.sections.leaderboard}
          </h3>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            {leaderboard.map((entry, idx) => (
              <div
                key={entry.userId}
                className={[
                  'flex items-center gap-3 px-4 py-3',
                  idx < leaderboard.length - 1 ? 'border-b border-gray-100' : '',
                  entry.isCurrentUser ? 'bg-emerald-50' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                    entry.rank === 1 ? 'bg-amber-400 text-white' :
                    entry.rank === 2 ? 'bg-gray-300 text-gray-700' :
                    entry.rank === 3 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {entry.rank}
                </span>
                <span className={`flex-1 text-sm font-medium ${entry.isCurrentUser ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {entry.username}
                  {entry.isCurrentUser && <span className="ml-1.5 text-xs text-emerald-500">{t.achievements.leaderboard.youLabel}</span>}
                </span>
                <span className="text-sm font-semibold text-gray-700 tabular-nums">
                  {entry.summitCount}
                  <span className="text-xs text-gray-400 font-normal ml-1">{t.achievements.leaderboard.summitsLabel}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label={t.achievements.stats.totalElevation}
          value={stats.totalElevation >= 1000 ? `${(stats.totalElevation / 1000).toFixed(1)}km` : `${stats.totalElevation}m`}
          icon="📐"
        />
        <StatCard label={t.achievements.stats.regionsExplored} value={String(stats.regionsExplored)} icon="🗺️" />
        <StatCard
          label={t.achievements.stats.highestPeak}
          value={stats.highestPeak ? `${stats.highestPeak.altitude}m` : '—'}
          sub={stats.highestPeak?.name}
          icon="🏔️"
        />
        <StatCard
          label={`${t.achievements.stats.summitsThisYear} ${new Date().getFullYear()}`}
          value={String(stats.hikedThisYear)}
          icon="📅"
        />
        <StatCard
          label={t.achievements.stats.badgesEarned}
          value={`${unlockedCount} / ${achievements.length}`}
          icon="🏅"
        />
        <StatCard
          label={t.achievements.stats.totalSummits}
          value={String(stats.totalSummits)}
          icon="⛰️"
        />
      </div>

      {/* Region Progress */}
      {regionProgress.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {t.achievements.sections.regionProgress}
          </h3>
          <div className="space-y-2">
            {regionProgress.map(({ regionId, name, total, hiked }) => (
              <div key={regionId} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-800 truncate">{name}</span>
                  <span className="text-xs text-gray-400 tabular-nums shrink-0 ml-2">
                    {hiked}/{total}
                    {hiked === total && total > 0 && (
                      <span className="ml-1 text-emerald-500">✓</span>
                    )}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={[
                      'h-full rounded-full transition-all duration-500',
                      hiked === total && total > 0 ? 'bg-emerald-500' : 'bg-emerald-400',
                    ].join(' ')}
                    style={{ width: total > 0 ? `${(hiked / total) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements list */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
          {t.achievements.sections.achievements}
        </h3>
        <div className="space-y-2">
          {sorted.map((a) => (
            <div
              key={a.id}
              className={[
                'flex items-center gap-3 rounded-xl p-3 border transition-all',
                a.unlocked
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : 'border-gray-100 bg-gray-50/70',
              ].join(' ')}
            >
              <span
                className={`text-2xl shrink-0 select-none ${!a.unlocked ? 'grayscale opacity-40' : ''}`}
              >
                {a.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-semibold ${
                    a.unlocked ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {a.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{a.description}</p>
                {a.progress && !a.unlocked && (
                  <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full transition-all"
                      style={{ width: `${(a.progress.current / a.progress.total) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              {a.unlocked ? (
                <span className="shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  ✓
                </span>
              ) : a.progress ? (
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">
                  {a.progress.current}/{a.progress.total}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      {hikes.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {t.achievements.sections.recentActivity}
          </h3>
          <div className="space-y-2">
            {[...hikes]
              .sort((a, b) => new Date(b.hikedAt).getTime() - new Date(a.hikedAt).getTime())
              .slice(0, 5)
              .map((hike) => {
                const m = hike.mountain ?? mountains.find((x) => x.id === hike.mountainId);
                return (
                  <div
                    key={hike.id}
                    className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-3"
                  >
                    <span className="text-lg select-none shrink-0">🥾</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {m?.name ?? t.achievements.unknownPeak}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m?.altitude && `${m.altitude}m · `}
                        {new Date(hike.hikedAt).toLocaleDateString('de-AT', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    {hike.rating && (
                      <span className="shrink-0 text-sm text-amber-400">
                        {'★'.repeat(hike.rating)}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats.totalSummits === 0 && (
        <p className="text-center text-sm text-gray-400 py-2">
          {t.achievements.emptyState}
        </p>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
        <span className="text-base select-none">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="text-xl font-bold text-gray-900 leading-none">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1 truncate">{sub}</p>}
    </div>
  );
}
