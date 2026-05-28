'use client';

import { useRegions } from '@/lib/queries';
import type { Region } from '@vorarlberg-peaks/types';

interface Filters {
  regionId?: string;
  difficulty?: string;
  search?: string;
  hiked?: boolean;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount: number;
  hikedCount: number;
}

export function FilterBar({ filters, onChange, totalCount, hikedCount }: FilterBarProps) {
  const { data: regions } = useRegions();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          <span className="font-semibold text-emerald-600">{hikedCount}</span> / {totalCount} summits reached
        </div>
        <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: totalCount ? `${(hikedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Search mountains..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ ...filters, search: e.target.value || undefined })}
          className="flex-1 min-w-36 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        <select
          value={filters.regionId ?? ''}
          onChange={(e) => onChange({ ...filters, regionId: e.target.value || undefined })}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">All regions</option>
          {regions?.map((r: Region) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>

        <select
          value={filters.difficulty ?? ''}
          onChange={(e) => onChange({ ...filters, difficulty: e.target.value || undefined })}
          className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">All levels</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      {/* Hiked filter toggle */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
        {([
          { label: 'All peaks', value: undefined },
          { label: '✓ Summited', value: true },
          { label: '○ Todo', value: false },
        ] as { label: string; value: boolean | undefined }[]).map(({ label, value }) => (
          <button
            key={String(value)}
            onClick={() => onChange({ ...filters, hiked: value })}
            className={[
              'flex-1 py-1.5 px-2 transition-colors',
              filters.hiked === value
                ? 'bg-emerald-500 text-white'
                : 'text-gray-500 hover:bg-gray-50',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
