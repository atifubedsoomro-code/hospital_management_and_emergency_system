import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Hospital, PatientDispatch } from '../types';
import { generateRoutePoints } from '../services/routingAlgorithm';

interface HospitalMapProps {
  hospitals: Hospital[];
  dispatches: PatientDispatch[];
  selectedDispatchId?: string;
  onSelectHospital?: (hospitalId: string) => void;
  heightClass?: string;
  zoom?: number;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  hospitals,
  dispatches,
  selectedDispatchId,
  onSelectHospital,
  heightClass = 'h-[480px]',
  zoom = 13,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = hospitals[0]?.latitude || 27.7120;
      const centerLng = hospitals[0]?.longitude || 68.8450;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: zoom,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | PulseSync Sukkur GIS',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Routes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    const bounds: L.LatLngExpression[] = [];

    // 1. Render Hospital Markers (Red, Black, White theme)
    hospitals.forEach((hosp) => {
      bounds.push([hosp.latitude, hosp.longitude]);

      const isDiverted = hosp.divertStatus;
      const icuFree = hosp.assets.icuAvailable;
      const traumaFree = hosp.assets.traumaBaysAvailable;
      const badgeBorder = isDiverted ? '#ef4444' : '#ffffff';

      const hospitalIconHtml = `
        <div class="relative flex flex-col items-center group cursor-pointer">
          <div class="px-2 py-0.5 rounded-md text-[10px] font-black text-white shadow-md mb-1 whitespace-nowrap border ${
            isDiverted 
              ? 'bg-red-950 border-red-600 text-red-200' 
              : 'bg-black border-zinc-700 text-white'
          }">
            ${hosp.shortName} • ${isDiverted ? 'DIVERT' : `ICU: ${icuFree}`}
          </div>
          <div class="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border-2" 
               style="background-color: #000000; border-color: ${badgeBorder}; box-shadow: 0 0 15px rgba(239, 68, 68, 0.5);">
            <svg class="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div class="w-2 h-2 rounded-full mt-0.5" style="background-color: ${badgeBorder};"></div>
        </div>
      `;

      const customHospitalIcon = L.divIcon({
        html: hospitalIconHtml,
        className: 'custom-hosp-marker',
        iconSize: [140, 64],
        iconAnchor: [70, 58],
        popupAnchor: [0, -56],
      });

      const popupContent = `
        <div class="p-3 text-white min-w-[240px]">
          <div class="flex items-center justify-between border-b border-zinc-700 pb-2 mb-2">
            <h4 class="font-black text-sm text-white">${hosp.name}</h4>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded ${
              isDiverted ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-zinc-800 text-white border border-zinc-700'
            }">
              ${isDiverted ? 'DIVERT ACTIVE' : 'OPEN 24/7'}
            </span>
          </div>
          <p class="text-xs text-zinc-400 mb-2">${hosp.address}</p>
          <div class="grid grid-cols-2 gap-2 text-xs mb-3">
            <div class="bg-black p-1.5 rounded border border-zinc-800">
              <span class="text-zinc-500 block text-[9px] uppercase font-bold">ICU BEDS</span>
              <span class="font-bold text-white">${icuFree} / ${hosp.assets.icuTotal}</span>
            </div>
            <div class="bg-black p-1.5 rounded border border-zinc-800">
              <span class="text-zinc-500 block text-[9px] uppercase font-bold">TRAUMA BAYS</span>
              <span class="font-bold text-red-400">${traumaFree} / ${hosp.assets.traumaBaysTotal}</span>
            </div>
            <div class="bg-black p-1.5 rounded border border-zinc-800">
              <span class="text-zinc-500 block text-[9px] uppercase font-bold">CATH LAB</span>
              <span class="font-bold ${hosp.assets.cathLabAvailable ? 'text-white' : 'text-zinc-500'}">
                ${hosp.assets.cathLabAvailable ? 'READY' : 'OFFLINE'}
              </span>
            </div>
            <div class="bg-black p-1.5 rounded border border-zinc-800">
              <span class="text-zinc-500 block text-[9px] uppercase font-bold">TOTAL BEDS</span>
              <span class="font-bold text-zinc-300">${hosp.assets.availableBeds} free</span>
            </div>
          </div>
          <div class="text-[11px] text-zinc-300 flex items-center justify-between">
            <span>Direct ER Line:</span>
            <span class="font-mono text-red-400 font-bold">${hosp.contactNumber}</span>
          </div>
        </div>
      `;

      const marker = L.marker([hosp.latitude, hosp.longitude], { icon: customHospitalIcon })
        .bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectHospital) onSelectHospital(hosp.id);
      });

      markersLayer.addLayer(marker);
    });

    // 2. Render Active Ambulances & Routes
    dispatches.forEach((disp) => {
      if (disp.status === 'handover_completed') return;

      bounds.push([disp.currentLat, disp.currentLng]);

      const isSelected = selectedDispatchId === disp.id;
      const isCritical = disp.esiLevel === 1;

      const ambulanceIconHtml = `
        <div class="relative flex flex-col items-center cursor-pointer">
          <div class="px-2 py-0.5 rounded text-[10px] font-black text-white shadow mb-1 whitespace-nowrap border bg-red-950 border-red-600">
            ${disp.ambulanceCallsign} • ${disp.etaMinutes}m
          </div>
          <div class="relative w-11 h-11 rounded-2xl flex items-center justify-center bg-red-600 shadow-xl border-2 border-white">
            <div class="absolute -inset-2 rounded-2xl bg-red-600/40 animate-ping-slow pointer-events-none"></div>
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 18.5a1.5 1.5 0 0 1-1.5-1.5 1.5 1.5 0 0 1 1.5-1.5 1.5 1.5 0 0 1 1.5 1.5 1.5 1.5 0 0 1-1.5 1.5m1.5-9H17V6h-7v3.5H4a2 2 0 0 0-2 2v6h1.08a3 3 0 0 0 5.84 0h6.16a3 3 0 0 0 5.84 0H22v-5l-2.5-3.5M6 18.5A1.5 1.5 0 0 1 4.5 17 1.5 1.5 0 0 1 6 15.5 1.5 1.5 0 0 1 7.5 17 1.5 1.5 0 0 1 6 18.5M11 9H8V8h3v1m0 4H9v-1h2v-2h1v2h2v1h-2v2h-1v-2Z"/>
            </svg>
          </div>
        </div>
      `;

      const customAmbulanceIcon = L.divIcon({
        html: ambulanceIconHtml,
        className: 'custom-amb-marker',
        iconSize: [140, 68],
        iconAnchor: [70, 60],
        popupAnchor: [0, -58],
      });

      const ambPopup = `
        <div class="p-3 text-white min-w-[250px]">
          <div class="flex items-center justify-between pb-2 border-b border-zinc-700 mb-2">
            <span class="font-bold text-red-500 text-sm">${disp.ambulanceCallsign}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white">
              ESI ${disp.esiLevel} CRITICAL
            </span>
          </div>
          <div class="space-y-1 text-xs mb-3">
            <div class="flex justify-between">
              <span class="text-zinc-400">Patient:</span>
              <span class="font-semibold text-white">${disp.patientName}, ${disp.age}y</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">Condition:</span>
              <span class="font-semibold text-red-400">${disp.condition}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">Transit ETA:</span>
              <span class="font-mono text-white font-bold text-sm">${disp.etaMinutes} mins (${disp.distanceKm} km)</span>
            </div>
            <div class="flex justify-between">
              <span class="text-zinc-400">Status:</span>
              <span class="text-white font-semibold uppercase text-[10px]">${disp.status.replace('_', ' ')}</span>
            </div>
          </div>
          <div class="bg-black p-2 rounded border border-zinc-800 font-mono text-[11px] grid grid-cols-3 gap-1 text-center">
            <div>
              <span class="text-[9px] text-zinc-500 block">HR</span>
              <span class="font-bold text-red-500">${disp.vitals.heartRate} bpm</span>
            </div>
            <div>
              <span class="text-[9px] text-zinc-500 block">BP</span>
              <span class="font-bold text-white">${disp.vitals.bloodPressureSystolic}/${disp.vitals.bloodPressureDiastolic}</span>
            </div>
            <div>
              <span class="text-[9px] text-zinc-500 block">SPO2</span>
              <span class="font-bold text-white">${disp.vitals.oxygenSaturation}%</span>
            </div>
          </div>
        </div>
      `;

      const ambMarker = L.marker([disp.currentLat, disp.currentLng], { icon: customAmbulanceIcon })
        .bindPopup(ambPopup);

      markersLayer.addLayer(ambMarker);

      if (disp.destinationLat && disp.destinationLng) {
        const routePoints = generateRoutePoints(
          disp.currentLat,
          disp.currentLng,
          disp.destinationLat,
          disp.destinationLng
        );

        const routeLine = L.polyline(routePoints, {
          color: isSelected ? '#ffffff' : '#ef4444',
          weight: isSelected ? 5 : 3.5,
          opacity: 0.9,
          dashArray: isSelected ? '6, 8' : '4, 6',
          lineCap: 'round',
        });

        markersLayer.addLayer(routeLine);
        if (isSelected) {
          routeLayerRef.current = routeLine;
        }
      }
    });

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds), { padding: [50, 50], maxZoom: 14 });
    }
  }, [hospitals, dispatches, selectedDispatchId, onSelectHospital]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current || hospitals.length === 0) return;
    const allCoords: [number, number][] = hospitals.map((h) => [h.latitude, h.longitude]);
    dispatches.forEach((d) => allCoords.push([d.currentLat, d.currentLng]));
    if (allCoords.length > 0) {
      mapInstanceRef.current.fitBounds(allCoords, { padding: [40, 40], maxZoom: 13 });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl bg-black">
      {/* Top Map Tactical HUD overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-xs shadow-lg">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
        <span className="font-bold text-white uppercase tracking-wider text-[11px]">Sukkur GIS Radar</span>
        <span className="text-zinc-600">|</span>
        <span className="text-red-400 font-mono font-medium">
          {dispatches.filter((d) => d.status !== 'handover_completed').length} Active En Route
        </span>
      </div>

      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        <button
          onClick={handleRecenter}
          className="bg-black/90 hover:bg-zinc-900 text-white px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border border-zinc-800 shadow-lg flex items-center gap-1.5 transition-all cursor-pointer"
          title="Recenter and fit all hospitals and ambulances"
        >
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          Fit Network
        </button>
      </div>

      {/* Leaflet Map container */}
      <div ref={mapContainerRef} className={`w-full ${heightClass}`} />

      {/* Bottom Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-4 bg-black/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 shadow">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white inline-block shadow-[0_0_8px_#ffffff]"></span>
          <span>Hospital (ICU Ready)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block shadow-[0_0_8px_#ef4444]"></span>
          <span>Ambulance (Critical)</span>
        </div>
        <div className="flex items-center gap-1.5 text-red-500 font-mono">
          <span>─── Emergency Fast Path</span>
        </div>
      </div>
    </div>
  );
};
