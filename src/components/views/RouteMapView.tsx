'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation, MapPin, Car, Bus, Bike, Footprints, Train,
  Locate, Leaf, RotateCcw, Play, Square, Timer,
  X, Loader2, ChevronUp, ChevronDown,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════
   EMISSION FACTORS (g CO₂ per km) — Industry Standard
   ═══════════════════════════════════════════════════════ */
const EMISSION_G: Record<string, number> = {
  car: 120, bike: 80, bus: 50, metro: 35, cycle: 0, walk: 0,
};
const COST_PER_KM: Record<string, number> = {
  car: 18, bike: 6, bus: 3, metro: 4, cycle: 0, walk: 0,
};

/* ═══ Transport modes ═══ */
const MODES = [
  { mode: 'car',   label: 'Car',      icon: Car,        color: '#ff453a', osrm: 'car',  emoji: '🚗' },
  { mode: 'bike',  label: 'Motorbike', icon: Bike,      color: '#ff9f0a', osrm: 'car',  emoji: '🏍️' },
  { mode: 'bus',   label: 'Bus',      icon: Bus,        color: '#007aff', osrm: 'car',  emoji: '🚌' },
  { mode: 'metro', label: 'Metro',    icon: Train,      color: '#5856d6', osrm: 'car',  emoji: '🚇' },
  { mode: 'cycle', label: 'Cycle',    icon: Bike,       color: '#30d158', osrm: 'bike', emoji: '🚲' },
  { mode: 'walk',  label: 'Walk',     icon: Footprints, color: '#34c759', osrm: 'foot', emoji: '🚶' },
];

/* ═══ Haversine (km) ═══ */
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ═══ Decode OSRM polyline ═══ */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

/* ═══ Format helpers ═══ */
function formatCO2(grams: number): string {
  if (grams === 0) return '0g';
  if (grams >= 1000) return `${(grams / 1000).toFixed(1)}kg`;
  return `${Math.round(grams)}g`;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ═══ Types ═══ */
interface RouteOption {
  mode: string;
  distanceKm: number;
  durationMin: number;
  co2: number;        // grams
  co2Saved: number;   // grams (vs car baseline)
  cost: number;       // INR
  geometry: [number, number][];
}

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface RouteMapProps {
  onRouteLogged?: (data: {
    from: string; to: string; mode: string;
    distanceKm: number; carbonEmitted: number; carbonSaved: number; moneySaved: number;
  }) => void;
}

/* ═══════════════════════════════════════════════════════
   ROUTE MAP VIEW
   Light map + OSRM routing + Real GPS + Live CO₂
   ═══════════════════════════════════════════════════════ */
export function RouteMapView({ onRouteLogged }: RouteMapProps) {
  const mapRef = useRef<any>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const routeLayerRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const watchIdRef = useRef<number | null>(null);
  const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);
  const leafletRef = useRef<any>(null);

  const [mapReady, setMapReady] = useState(false);
  const [fromText, setFromText] = useState('');
  const [toText, setToText] = useState('');
  const [fromCoords, setFromCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toCoords, setToCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fromResults, setFromResults] = useState<SearchResult[]>([]);
  const [toResults, setToResults] = useState<SearchResult[]>([]);
  const [searchingFrom, setSearchingFrom] = useState(false);
  const [searchingTo, setSearchingTo] = useState(false);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [activeRoute, setActiveRoute] = useState<RouteOption | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [panelState, setPanelState] = useState<'full' | 'mini' | 'hidden'>('full');
  const [routeLogged, setRouteLogged] = useState(false);

  // Live tracking
  const [tracking, setTracking] = useState(false);
  const [liveDistanceKm, setLiveDistanceKm] = useState(0);
  const [liveCo2, setLiveCo2] = useState(0);
  const [trackingMode, setTrackingMode] = useState('car');
  const [trackingDuration, setTrackingDuration] = useState(0);
  const trackingStartRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ═══ Load Leaflet (SSR safe) ═══ */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      const L = (await import('leaflet')).default;
      leafletRef.current = L;

      if (!mapDivRef.current || mapRef.current) return;

      const map = L.map(mapDivRef.current, {
        center: [12.9716, 77.5946],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      locateUser();
    };

    loadLeaflet();
    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  /* ═══ Tracking timer ═══ */
  useEffect(() => {
    if (tracking) {
      trackingStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setTrackingDuration(Math.floor((Date.now() - trackingStartRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [tracking]);

  /* ═══ Nominatim search ═══ */
  const searchPlaces = useCallback(async (query: string, isFrom: boolean) => {
    if (query.length < 3) {
      isFrom ? setFromResults([]) : setToResults([]);
      return;
    }
    isFrom ? setSearchingFrom(true) : setSearchingTo(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=in&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: SearchResult[] = await res.json();
      if (isFrom) { setFromResults(data); setShowFromDropdown(true); }
      else { setToResults(data); setShowToDropdown(true); }
    } catch { /* silent */ }
    finally { isFrom ? setSearchingFrom(false) : setSearchingTo(false); }
  }, []);

  const fromTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleFromChange = useCallback((val: string) => {
    setFromText(val); setFromCoords(null);
    if (fromTimerRef.current) clearTimeout(fromTimerRef.current);
    fromTimerRef.current = setTimeout(() => searchPlaces(val, true), 400);
  }, [searchPlaces]);

  const handleToChange = useCallback((val: string) => {
    setToText(val); setToCoords(null);
    if (toTimerRef.current) clearTimeout(toTimerRef.current);
    toTimerRef.current = setTimeout(() => searchPlaces(val, false), 400);
  }, [searchPlaces]);

  const selectFromResult = useCallback((r: SearchResult) => {
    setFromText(r.display_name.split(',').slice(0, 2).join(', '));
    setFromCoords({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setShowFromDropdown(false); setFromResults([]);
    mapRef.current?.setView([parseFloat(r.lat), parseFloat(r.lon)], 14);
  }, []);

  const selectToResult = useCallback((r: SearchResult) => {
    setToText(r.display_name.split(',').slice(0, 2).join(', '));
    setToCoords({ lat: parseFloat(r.lat), lng: parseFloat(r.lon) });
    setShowToDropdown(false); setToResults([]);
  }, []);

  /* ═══ Locate user ═══ */
  const locateUser = useCallback(async () => {
    setLocating(true); setError('');
    const getPos = (): Promise<{ lat: number; lng: number } | null> => {
      return import('@capacitor/geolocation')
        .then(({ Geolocation }) =>
          Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
            .then(p => ({ lat: p.coords.latitude, lng: p.coords.longitude }))
        )
        .catch(() =>
          new Promise((resolve) => {
            if (!navigator.geolocation) { resolve(null); return; }
            navigator.geolocation.getCurrentPosition(
              (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
              () => resolve(null), { enableHighAccuracy: true, timeout: 15000 }
            );
          })
        );
    };

    const pos = await getPos();
    if (pos && mapRef.current && leafletRef.current) {
      const L = leafletRef.current;
      mapRef.current.setView([pos.lat, pos.lng], 15);
      if (userMarkerRef.current) mapRef.current.removeLayer(userMarkerRef.current);
      userMarkerRef.current = L.circleMarker([pos.lat, pos.lng], {
        radius: 8, fillColor: '#4285f4', fillOpacity: 1, color: '#fff', weight: 3,
      }).addTo(mapRef.current);
      setFromCoords(pos);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json&zoom=16`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setFromText(data.address?.suburb || data.address?.neighbourhood || data.display_name?.split(',')[0] || 'Your Location');
      } catch { setFromText('Your Location'); }
    } else {
      setError('Could not get location. Enable GPS.');
    }
    setLocating(false);
  }, []);

  /* ═══ Find routes via OSRM ═══ */
  const handleFindRoutes = useCallback(async () => {
    if (!fromCoords || !toCoords) { setError('Select locations from suggestions.'); return; }
    setLoading(true); setError(''); setRoutes([]); setActiveRoute(null); setRouteLogged(false);

    const results: RouteOption[] = [];
    for (const m of MODES) {
      try {
        const url = `https://router.project-osrm.org/route/v1/${m.osrm}/${fromCoords.lng},${fromCoords.lat};${toCoords.lng},${toCoords.lat}?overview=full&geometries=polyline&steps=true`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 'Ok' && data.routes?.[0]) {
          const route = data.routes[0];
          const distKm = route.distance / 1000;
          let durMin = route.duration / 60;

          // Adjust duration for modes without dedicated OSRM profiles
          if (m.mode === 'bus') durMin *= 1.3;
          if (m.mode === 'metro') durMin *= 0.7;
          if (m.mode === 'bike') durMin *= 0.85;

          // CO₂ = Distance (km) × Emission Factor (g/km)
          const co2 = distKm * EMISSION_G[m.mode];
          // Carbon Saved = (Distance × 120g) − (Distance × Mode Factor)
          const co2Saved = Math.max(0, (distKm * EMISSION_G.car) - co2);
          const cost = Math.round(distKm * COST_PER_KM[m.mode]);

          results.push({
            mode: m.mode, distanceKm: distKm, durationMin: durMin,
            co2, co2Saved, cost, geometry: decodePolyline(route.geometry),
          });
        }
      } catch { /* skip */ }
    }

    if (results.length === 0) {
      setError('No routes found. Try different locations.');
    } else {
      setRoutes(results);
      const greenest = [...results].sort((a, b) => a.co2 - b.co2)[0];
      setActiveRoute(greenest);
      renderRoute(greenest);
      setPanelState('full');
    }
    setLoading(false);
  }, [fromCoords, toCoords]);

  /* ═══ Render route on map ═══ */
  const renderRoute = useCallback((route: RouteOption) => {
    if (!mapRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    if (routeLayerRef.current) mapRef.current.removeLayer(routeLayerRef.current);
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const modeInfo = MODES.find(m => m.mode === route.mode);
    const polyline = L.polyline(route.geometry, {
      color: modeInfo?.color || '#4285f4', weight: 5, opacity: 0.85, smoothFactor: 1,
    }).addTo(mapRef.current);
    routeLayerRef.current = polyline;

    if (fromCoords) {
      const m = L.marker([fromCoords.lat, fromCoords.lng], {
        icon: L.divIcon({
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#30d158;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7], className: '',
        }),
      }).addTo(mapRef.current);
      markersRef.current.push(m);
    }
    if (toCoords) {
      const m = L.marker([toCoords.lat, toCoords.lng], {
        icon: L.divIcon({
          html: '<div style="width:14px;height:14px;border-radius:50%;background:#ff453a;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
          iconSize: [14, 14], iconAnchor: [7, 7], className: '',
        }),
      }).addTo(mapRef.current);
      markersRef.current.push(m);
    }
    mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }, [fromCoords, toCoords]);

  const selectRoute = useCallback((route: RouteOption) => {
    setActiveRoute(route);
    renderRoute(route);
  }, [renderRoute]);

  /* ═══ Live GPS tracking ═══ */
  const startTracking = useCallback(() => {
    if (!activeRoute) return;
    setTracking(true); setLiveDistanceKm(0); setLiveCo2(0);
    setTrackingDuration(0); setTrackingMode(activeRoute.mode);
    prevPosRef.current = null; setPanelState('hidden');

    const startWatch = async () => {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        const id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (position, err) => {
          if (err || !position) return;
          updateLivePosition(position.coords.latitude, position.coords.longitude);
        });
        watchIdRef.current = parseInt(id as any) || 0;
      } catch {
        if (navigator.geolocation) {
          const id = navigator.geolocation.watchPosition(
            (pos) => updateLivePosition(pos.coords.latitude, pos.coords.longitude),
            () => {}, { enableHighAccuracy: true, maximumAge: 2000 }
          );
          watchIdRef.current = id;
        }
      }
    };
    startWatch();
  }, [activeRoute]);

  const updateLivePosition = useCallback((lat: number, lng: number) => {
    if (userMarkerRef.current && mapRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
    if (prevPosRef.current) {
      const delta = haversine(prevPosRef.current.lat, prevPosRef.current.lng, lat, lng);
      if (delta > 0.005) { // >5m jitter filter
        setLiveDistanceKm(prev => {
          const newDist = prev + delta;
          // Live CO₂ = cumulative distance × emission factor
          setLiveCo2(newDist * EMISSION_G[trackingMode]);
          return newDist;
        });
        prevPosRef.current = { lat, lng };
      }
    } else {
      prevPosRef.current = { lat, lng };
    }
  }, [trackingMode]);

  const stopTracking = useCallback(async () => {
    setTracking(false);
    if (watchIdRef.current !== null) {
      try {
        const { Geolocation } = await import('@capacitor/geolocation');
        await Geolocation.clearWatch({ id: String(watchIdRef.current) });
      } catch { navigator.geolocation?.clearWatch(watchIdRef.current); }
      watchIdRef.current = null;
    }
    if (liveDistanceKm > 0.01) {
      const carCo2 = liveDistanceKm * EMISSION_G.car;
      const saved = Math.max(0, carCo2 - liveCo2);
      onRouteLogged?.({
        from: fromText || 'Start', to: toText || 'Current', mode: trackingMode,
        distanceKm: liveDistanceKm, carbonEmitted: liveCo2, carbonSaved: saved,
        moneySaved: Math.max(0, Math.round(liveDistanceKm * COST_PER_KM.car) - Math.round(liveDistanceKm * (COST_PER_KM[trackingMode] || 0))),
      });
      setRouteLogged(true);
    }
    setPanelState('full');
  }, [liveDistanceKm, liveCo2, trackingMode, fromText, toText, onRouteLogged]);

  const handleLogRoute = useCallback(() => {
    if (!activeRoute || routeLogged) return;
    onRouteLogged?.({
      from: fromText, to: toText, mode: activeRoute.mode,
      distanceKm: activeRoute.distanceKm, carbonEmitted: activeRoute.co2,
      carbonSaved: activeRoute.co2Saved,
      moneySaved: Math.max(0, Math.round(activeRoute.distanceKm * COST_PER_KM.car) - activeRoute.cost),
    });
    setRouteLogged(true);
  }, [activeRoute, routeLogged, fromText, toText, onRouteLogged]);

  const handleReset = useCallback(() => {
    setFromText(''); setToText(''); setFromCoords(null); setToCoords(null);
    setRoutes([]); setActiveRoute(null); setError(''); setRouteLogged(false);
    setTracking(false); setLiveDistanceKm(0); setLiveCo2(0); setPanelState('full');
    if (routeLayerRef.current && mapRef.current) {
      mapRef.current.removeLayer(routeLayerRef.current); routeLayerRef.current = null;
    }
    markersRef.current.forEach(m => mapRef.current?.removeLayer(m));
    markersRef.current = [];
  }, []);

  const cyclePanelState = () => {
    if (panelState === 'full') setPanelState('mini');
    else if (panelState === 'mini') setPanelState('hidden');
    else setPanelState('full');
  };

  const liveSaved = Math.max(0, liveDistanceKm * EMISSION_G.car - liveCo2);

  return (
    <div className="relative w-full rounded-[16px] overflow-hidden" style={{ height: '520px' }}>
      {/* MAP */}
      <div ref={mapDivRef} className="absolute inset-0 z-0" style={{ background: '#f2f2f7' }} />

      {/* Loading */}
      {!mapReady && (
        <div className="absolute inset-0 bg-[#f2f2f7] flex items-center justify-center z-10">
          <div className="text-center">
            <motion.div
              className="w-10 h-10 border-3 border-[#4285f4]/30 border-t-[#4285f4] rounded-full mx-auto mb-3"
              animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-[13px] text-[#8e8e93]">Loading map...</p>
          </div>
        </div>
      )}

      {/* ═══ LIVE TRACKING HUD ═══ */}
      <AnimatePresence>
        {tracking && (
          <motion.div
            initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }}
            className="absolute top-3 left-3 right-14 z-[1000]"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-[14px] p-3 border border-black/5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <motion.div className="w-2.5 h-2.5 rounded-full bg-[#ff453a]"
                    animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
                  <span className="text-[13px] font-semibold text-[#1c1c1e]">TRACKING LIVE</span>
                </div>
                <div className="flex items-center gap-1 text-[#8e8e93]">
                  <Timer className="w-3.5 h-3.5" />
                  <span className="text-[12px] tabular-nums font-mono">{formatDuration(trackingDuration)}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-[18px] font-bold text-[#007aff] tabular-nums">{liveDistanceKm.toFixed(2)}</p>
                  <p className="text-[9px] text-[#8e8e93] uppercase">km</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-bold text-[#ff9f0a] tabular-nums">{formatCO2(liveCo2)}</p>
                  <p className="text-[9px] text-[#8e8e93] uppercase">CO₂ emitted</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-bold text-[#30d158] tabular-nums">{formatCO2(liveSaved)}</p>
                  <p className="text-[9px] text-[#8e8e93] uppercase">CO₂ saved</p>
                </div>
              </div>
              <div className="mt-2 p-2 rounded-[8px] bg-[#f2f2f7] text-center">
                <p className="text-[10px] text-[#8e8e93]">
                  Formula: {liveDistanceKm.toFixed(2)}km × {EMISSION_G[trackingMode]}g/km = {formatCO2(liveCo2)}
                </p>
              </div>
              <button onClick={stopTracking}
                className="w-full mt-2 py-2.5 rounded-[10px] bg-[#ff453a] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5">
                <Square className="w-3.5 h-3.5" /> Stop & Log Trip
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MAP CONTROLS ═══ */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
        <button onClick={locateUser} disabled={locating}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-black/5">
          {locating ? <Loader2 className="w-5 h-5 text-[#4285f4] animate-spin" /> : <Locate className="w-5 h-5 text-[#4285f4]" />}
        </button>
        {routes.length > 0 && !tracking && (
          <button onClick={handleReset}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg border border-black/5">
            <RotateCcw className="w-4 h-4 text-[#8e8e93]" />
          </button>
        )}
      </div>

      {/* ═══ BOTTOM PANEL ═══ */}
      {!tracking && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000]">
          {/* Drag handle */}
          <button onClick={cyclePanelState}
            className="w-full flex flex-col items-center py-2 bg-white/95 backdrop-blur-md rounded-t-[16px] border-t border-black/5 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <div className="w-10 h-1 rounded-full bg-black/15 mb-1" />
            {panelState === 'hidden' && (
              <div className="flex items-center gap-1.5">
                <ChevronUp className="w-3.5 h-3.5 text-[#8e8e93]" />
                <span className="text-[11px] text-[#8e8e93] font-medium">
                  {activeRoute
                    ? `${MODES.find(m => m.mode === activeRoute.mode)?.emoji} ${activeRoute.distanceKm.toFixed(1)}km · ${formatCO2(activeRoute.co2)} CO₂ · ${formatCO2(activeRoute.co2Saved)} saved`
                    : 'Tap to plan route'}
                </span>
              </div>
            )}
            {panelState === 'mini' && activeRoute && (
              <div className="flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-[#8e8e93]" />
                <span className="text-[11px] text-[#8e8e93] font-medium">Tap to collapse</span>
              </div>
            )}
          </button>

          {/* Panel content */}
          <AnimatePresence>
            {panelState !== 'hidden' && (
              <motion.div
                initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                className="overflow-hidden bg-white/95 backdrop-blur-md"
              >
                <div className="px-4 pb-4 space-y-3" style={{ maxHeight: panelState === 'mini' ? '120px' : '320px', overflowY: 'auto' }}>

                  {/* ═══ SEARCH (only when no routes yet) ═══ */}
                  {routes.length === 0 && panelState === 'full' && (
                    <>
                      <div className="space-y-2">
                        {/* From */}
                        <div className="relative">
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[#f2f2f7] border border-black/5 focus-within:border-[#30d158]/50">
                            <div className="w-3 h-3 rounded-full bg-[#30d158] shrink-0" />
                            <input value={fromText} onChange={e => handleFromChange(e.target.value)}
                              onFocus={() => fromResults.length > 0 && setShowFromDropdown(true)}
                              placeholder="Starting point (or tap locate)"
                              className="flex-1 bg-transparent text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] outline-none" />
                            {searchingFrom && <Loader2 className="w-4 h-4 text-[#8e8e93] animate-spin shrink-0" />}
                            {fromText && (
                              <button onClick={() => { setFromText(''); setFromCoords(null); setFromResults([]); }}>
                                <X className="w-4 h-4 text-[#8e8e93]" />
                              </button>
                            )}
                          </div>
                          {showFromDropdown && fromResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[10px] border border-black/5 shadow-xl overflow-hidden z-50">
                              {fromResults.map((r, i) => (
                                <button key={i} onClick={() => selectFromResult(r)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f2f2f7] transition-colors border-b border-black/5 last:border-0">
                                  <MapPin className="w-4 h-4 text-[#30d158] shrink-0" />
                                  <span className="text-[13px] text-[#3a3a3c] truncate">{r.display_name.split(',').slice(0, 3).join(', ')}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* To */}
                        <div className="relative">
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] bg-[#f2f2f7] border border-black/5 focus-within:border-[#ff453a]/50">
                            <div className="w-3 h-3 rounded-full bg-[#ff453a] shrink-0" />
                            <input value={toText} onChange={e => handleToChange(e.target.value)}
                              onFocus={() => toResults.length > 0 && setShowToDropdown(true)}
                              placeholder="Where to?"
                              className="flex-1 bg-transparent text-[14px] text-[#1c1c1e] placeholder:text-[#8e8e93] outline-none" />
                            {searchingTo && <Loader2 className="w-4 h-4 text-[#8e8e93] animate-spin shrink-0" />}
                            {toText && (
                              <button onClick={() => { setToText(''); setToCoords(null); setToResults([]); }}>
                                <X className="w-4 h-4 text-[#8e8e93]" />
                              </button>
                            )}
                          </div>
                          {showToDropdown && toResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-[10px] border border-black/5 shadow-xl overflow-hidden z-50">
                              {toResults.map((r, i) => (
                                <button key={i} onClick={() => selectToResult(r)}
                                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-[#f2f2f7] transition-colors border-b border-black/5 last:border-0">
                                  <MapPin className="w-4 h-4 text-[#ff453a] shrink-0" />
                                  <span className="text-[13px] text-[#3a3a3c] truncate">{r.display_name.split(',').slice(0, 3).join(', ')}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {error && <p className="text-[12px] text-[#ff453a] text-center">{error}</p>}

                      <button onClick={handleFindRoutes} disabled={loading || !fromCoords || !toCoords}
                        className="w-full py-3 rounded-[12px] bg-[#4285f4] text-white text-[15px] font-semibold disabled:opacity-40 flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Navigation className="w-4 h-4" /> Find Eco Routes</>}
                      </button>

                      {!fromCoords && !toCoords && (
                        <p className="text-[11px] text-[#c7c7cc] text-center">Search for places and select from suggestions</p>
                      )}
                    </>
                  )}

                  {/* ═══ ROUTE RESULTS ═══ */}
                  {routes.length > 0 && (
                    <div className="space-y-2">
                      {/* Route header */}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#30d158]" />
                        <p className="text-[12px] text-[#8e8e93] flex-1 truncate">
                          {fromText} <span className="text-[#c7c7cc] mx-1">&rarr;</span> {toText}
                        </p>
                      </div>

                      {/* Route cards */}
                      {panelState === 'full' && (
                        <div className="space-y-1.5">
                          {routes.map(r => {
                            const info = MODES.find(m => m.mode === r.mode)!;
                            const Icon = info.icon;
                            const isActive = activeRoute?.mode === r.mode;
                            const isGreenest = r.mode === [...routes].sort((a, b) => a.co2 - b.co2)[0].mode;
                            return (
                              <button key={r.mode} onClick={() => selectRoute(r)}
                                className={`w-full flex items-center gap-3 p-3 rounded-[12px] transition-all ${isActive ? 'ring-1' : ''}`}
                                style={{
                                  backgroundColor: isActive ? `${info.color}12` : '#f2f2f7',
                                  ...(isActive ? { borderColor: info.color } : {}),
                                }}>
                                <div className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                                  style={{ backgroundColor: `${info.color}18` }}>
                                  <Icon className="w-4.5 h-4.5" style={{ color: info.color }} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-[14px] font-medium text-[#1c1c1e]">{info.label}</p>
                                    {isGreenest && (
                                      <span className="px-1.5 py-0.5 rounded-full bg-[#30d158]/15 text-[9px] font-bold text-[#30d158]">ECO</span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#8e8e93]">
                                    {r.distanceKm.toFixed(1)}km &middot; {Math.round(r.durationMin)}min
                                    {r.cost > 0 ? ` · ~₹${r.cost}` : ' · Free'}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[13px] font-bold tabular-nums" style={{ color: r.co2 > 0 ? info.color : '#30d158' }}>
                                    {formatCO2(r.co2)}
                                  </p>
                                  <p className="text-[10px] text-[#c7c7cc]">CO₂</p>
                                </div>
                                {r.co2Saved > 0 && (
                                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[#30d158]/15 shrink-0">
                                    <Leaf className="w-3 h-3 text-[#30d158]" />
                                    <span className="text-[10px] font-medium text-[#30d158]">-{formatCO2(r.co2Saved)}</span>
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* CO₂ breakdown */}
                      {activeRoute && (
                        <div className="p-3 rounded-[12px] bg-[#f2f2f7] border border-black/5">
                          <p className="text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-2">CO₂ Calculation</p>
                          <div className="p-2 rounded-[8px] bg-white mb-2">
                            <p className="text-[11px] text-[#3a3a3c] font-mono leading-relaxed">
                              Distance: {activeRoute.distanceKm.toFixed(2)} km<br/>
                              {MODES.find(m => m.mode === activeRoute.mode)?.label} Factor: {EMISSION_G[activeRoute.mode]}g/km<br/>
                              CO₂ Emitted: {activeRoute.distanceKm.toFixed(2)} × {EMISSION_G[activeRoute.mode]} = <strong>{formatCO2(activeRoute.co2)}</strong><br/>
                              Car Baseline: {activeRoute.distanceKm.toFixed(2)} × 120 = {formatCO2(activeRoute.distanceKm * 120)}<br/>
                              <span className="text-[#30d158]">CO₂ Saved: {formatCO2(activeRoute.co2Saved)}</span>
                            </p>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-[15px] font-bold text-[#30d158] tabular-nums">{formatCO2(activeRoute.co2Saved)}</p>
                              <p className="text-[10px] text-[#8e8e93]">CO₂ Saved</p>
                            </div>
                            <div>
                              <p className="text-[15px] font-bold text-[#4285f4] tabular-nums">
                                {activeRoute.cost > 0 ? `₹${activeRoute.cost}` : 'Free'}
                              </p>
                              <p className="text-[10px] text-[#8e8e93]">Est. Cost</p>
                            </div>
                            <div>
                              <p className="text-[15px] font-bold text-[#ff9f0a] tabular-nums">{Math.round(activeRoute.durationMin)}m</p>
                              <p className="text-[10px] text-[#8e8e93]">Duration</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action buttons */}
                      {activeRoute && panelState === 'full' && (
                        <div className="flex gap-2">
                          <button onClick={startTracking}
                            className="flex-1 py-3 rounded-[12px] bg-[#4285f4] text-white text-[14px] font-semibold flex items-center justify-center gap-1.5">
                            <Play className="w-4 h-4" /> Start Trip
                          </button>
                          <button onClick={handleLogRoute} disabled={routeLogged}
                            className={`flex-1 py-3 rounded-[12px] text-[14px] font-semibold flex items-center justify-center gap-1.5 ${
                              routeLogged ? 'bg-[#30d158]/20 text-[#30d158]' : 'bg-[#30d158] text-white'
                            }`}>
                            {routeLogged ? <><Leaf className="w-4 h-4" /> Logged</> : <><Navigation className="w-4 h-4" /> Log Route</>}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
