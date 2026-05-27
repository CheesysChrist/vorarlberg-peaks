'use client';

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MountainWithHikeStatus } from '@vorarlberg-peaks/types';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

interface PeaksMapProps {
  mountains: MountainWithHikeStatus[];
  onMountainSelect?: (mountain: MountainWithHikeStatus) => void;
}

export function PeaksMap({ mountains, onMountainSelect }: PeaksMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [9.9, 47.25], // Vorarlberg center
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

    if (!mapRef.current) return;

    mountains.forEach((mountain) => {
      const el = document.createElement('div');
      el.className = [
        'w-5 h-5 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125',
        mountain.hiked ? 'bg-emerald-500' : 'bg-slate-400',
      ].join(' ');

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
        `<div class="text-sm font-medium">${mountain.name}</div>
         <div class="text-xs text-gray-500">${mountain.altitude}m · ${mountain.region?.name ?? ''}</div>
         ${mountain.hiked ? '<div class="text-xs text-emerald-600 mt-1">✓ Hiked</div>' : ''}`,
      );

      const marker = new mapboxgl.Marker(el)
        .setLngLat([mountain.longitude, mountain.latitude])
        .setPopup(popup)
        .addTo(mapRef.current!);

      el.addEventListener('click', () => onMountainSelect?.(mountain));
      markersRef.current.push(marker);
    });
  }, [mountains, onMountainSelect]);

  return <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden" />;
}
