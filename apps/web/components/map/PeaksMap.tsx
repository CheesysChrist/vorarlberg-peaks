'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MountainWithHikeStatus } from '@vorarlberg-peaks/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const DIFFICULTY_STYLE: Record<string, { color: string; label: string }> = {
  easy:     { color: '#16a34a', label: 'Easy' },
  moderate: { color: '#ca8a04', label: 'Moderate' },
  hard:     { color: '#ea580c', label: 'Hard' },
  expert:   { color: '#dc2626', label: 'Expert' },
};

function buildPopupHTML(mountain: MountainWithHikeStatus): string {
  const diff = mountain.difficulty ? DIFFICULTY_STYLE[mountain.difficulty] : null;
  const hikeDate = mountain.hikedAt
    ? new Date(mountain.hikedAt).toLocaleDateString('de-AT', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;min-width:160px;padding:2px 0">
      <div style="font-weight:700;font-size:13px;color:#111827;line-height:1.3">${mountain.name}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap">
        <span>${mountain.altitude}m</span>
        ${mountain.region?.name ? `<span style="opacity:.5">·</span><span>${mountain.region.name}</span>` : ''}
        ${diff ? `<span style="opacity:.5">·</span><span style="color:${diff.color};font-weight:600">${diff.label}</span>` : ''}
      </div>
      ${mountain.hiked && hikeDate ? `
        <div style="margin-top:7px;padding:4px 8px;background:#ecfdf5;border-radius:6px;font-size:11px;color:#059669;font-weight:500">
          ✓ ${hikeDate}
        </div>
      ` : !mountain.hiked ? `
        <div style="margin-top:7px;font-size:11px;color:#9ca3af">Click to log this summit</div>
      ` : ''}
    </div>
  `;
}

interface PeaksMapProps {
  mountains: MountainWithHikeStatus[];
  onMountainSelect?: (mountain: MountainWithHikeStatus) => void;
  /** Opaque key — when it changes AND mountains < full set, map fits to them */
  fitKey?: string;
  selectedMountainId?: string | null;
}

export function PeaksMap({ mountains, onMountainSelect, fitKey, selectedMountainId }: PeaksMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markerElsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevFitKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [9.9, 47.25],
      zoom: 9,
      bounds: [
        [9.5, 47.0],
        [10.3, 47.6],
      ],
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    markerElsRef.current.clear();

    if (!mapRef.current) return;

    mountains.forEach((mountain) => {
      const el = document.createElement('div');
      el.className = [
        'w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-all',
        mountain.hiked ? 'bg-emerald-500' : 'bg-slate-400',
      ].join(' ');
      markerElsRef.current.set(mountain.id, el);

      const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, maxWidth: '220px' })
        .setHTML(buildPopupHTML(mountain));

      const marker = new mapboxgl.Marker(el)
        .setLngLat([mountain.longitude, mountain.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      el.addEventListener('click', () => onMountainSelect?.(mountain));
      markersRef.current.push(marker);
    });

    // Fit viewport when a filter is active and produces a focused result set
    if (fitKey !== prevFitKey.current && mountains.length > 0 && mountains.length <= 30) {
      const bounds = new mapboxgl.LngLatBounds();
      mountains.forEach((m) => bounds.extend([m.longitude, m.latitude]));
      mapRef.current?.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 700 });
    }
    prevFitKey.current = fitKey;
  }, [mountains, onMountainSelect, fitKey]);

  // Update selected pin styling without re-rendering all markers
  useEffect(() => {
    markerElsRef.current.forEach((el, id) => {
      const isSelected = id === selectedMountainId;
      el.style.transform = isSelected ? 'scale(1.5)' : '';
      el.style.boxShadow = isSelected ? '0 0 0 3px #10b981, 0 2px 8px rgba(0,0,0,0.3)' : '';
      el.style.zIndex = isSelected ? '10' : '';
    });
  }, [selectedMountainId]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
