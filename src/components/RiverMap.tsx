import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Activity,
  AlertTriangle,
  Anchor,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Battery,
  Bot,
  CheckCircle2,
  Compass,
  Crosshair,
  Droplets,
  Eye,
  Info,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Pause,
  Play,
  Radio,
  RotateCw,
  Shield,
  ShieldCheck,
  Sliders,
  Square,
  Sun,
  Trash2,
  Waves,
  Wind,
  X,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { FleetRobot, RiverSector, TelemetryPoint, RiverLandmark } from '../types';
import { INITIAL_FLEET_ROBOTS, RIVER_SECTORS } from '../utils/simulation';
import { detectObstaclesAhead, ObstacleWarning } from '../utils/navigation';

export interface RiverMapProps {
  history: TelemetryPoint[];
  currentPoint: TelemetryPoint;
  selectedSector: RiverSector;
  fleetRobots?: FleetRobot[];
  selectedRobotId?: string;
  onSelectRobot?: (robotId: string) => void;
  onSelectPoint?: (point: TelemetryPoint) => void;
  highlightedCoords?: [number, number] | null;
  onControlRobot?: (
    robotId: string,
    action: 'forward' | 'reverse' | 'turn_left' | 'turn_right' | 'set_heading' | 'toggle_mode' | 'set_speed' | 'stop',
    value?: any
  ) => void;
  isControlPanelOpen?: boolean;
  onToggleControlPanel?: () => void;
}

export type ActiveInspector =
  | { type: 'robot'; robot: FleetRobot }
  | { type: 'landmark'; landmark: RiverLandmark }
  | null;

export const RiverMap: React.FC<RiverMapProps> = ({
  history,
  currentPoint,
  selectedSector = RIVER_SECTORS[0],
  fleetRobots = INITIAL_FLEET_ROBOTS,
  selectedRobotId = 'TT-01',
  onSelectRobot,
  onSelectPoint,
  highlightedCoords,
  onControlRobot,
  isControlPanelOpen = true,
  onToggleControlPanel,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Zoom & Pan state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTrails, setShowTrails] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showBathymetry, setShowBathymetry] = useState<boolean>(true);
  const [showGoogleDetails, setShowGoogleDetails] = useState<boolean>(true);
  const [followActiveBot, setFollowActiveBot] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Steering panel dock state
  const [isSteeringPanelOpen, setIsSteeringPanelOpen] = useState<boolean>(true);

  // Active hover & clicked detail inspector
  const [activeInspector, setActiveInspector] = useState<ActiveInspector>(null);
  const [hoveredRobotId, setHoveredRobotId] = useState<string | null>(null);
  const [hoveredLandmarkId, setHoveredLandmarkId] = useState<string | null>(null);

  // Guarantee valid fleet robots with fallbacks
  const safeFleet = useMemo(() => {
    if (fleetRobots && fleetRobots.length > 0) return fleetRobots;
    return INITIAL_FLEET_ROBOTS;
  }, [fleetRobots]);

  const activeRobot = useMemo(() => {
    return safeFleet.find((r) => r.id === selectedRobotId) || safeFleet[0];
  }, [safeFleet, selectedRobotId]);

  // Virtual SVG canvas coordinate space
  const SVG_W = 1000;
  const SVG_H = 700;

  // Rock-solid coordinate projector from geographic lat/lng to SVG canvas x/y
  // Centered on Tapan Dighi (25.2890° N, 88.5830° E)
  const project = (lat: number, lng: number): { x: number; y: number } => {
    const centerLat = selectedSector?.startPoint?.[0] ?? 25.2890;
    const centerLng = selectedSector?.startPoint?.[1] ?? 88.5830;
    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : centerLat;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : centerLng;
    const x = Math.round(500 + (safeLng - centerLng) * 62000);
    const y = Math.round(350 - (safeLat - centerLat) * 46000);
    return {
      x: Math.max(50, Math.min(950, isNaN(x) ? 500 : x)),
      y: Math.max(50, Math.min(650, isNaN(y) ? 350 : y)),
    };
  };

  // Keyboard navigation listener (Arrow keys & WASD for active robot)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (!activeRobot || !onControlRobot) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        onControlRobot(activeRobot.id, 'forward');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        onControlRobot(activeRobot.id, 'reverse');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onControlRobot(activeRobot.id, 'turn_left', 15);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        onControlRobot(activeRobot.id, 'turn_right', 15);
      } else if (e.key === ' ') {
        e.preventDefault();
        onControlRobot(activeRobot.id, 'stop');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeRobot, onControlRobot]);

  // Convert polygon coordinates to smooth organic curve path
  const pondCoords = useMemo(() => {
    const coords = selectedSector.pondPolygon || selectedSector.waypoints;
    return coords.map(([lat, lng]) => project(lat, lng));
  }, [selectedSector]);

  // Generate smooth closed Bezier spline for organic pond edges
  const pondSmoothPath = useMemo(() => {
    if (pondCoords.length < 3) return '';
    let d = `M ${pondCoords[0].x} ${pondCoords[0].y}`;
    const n = pondCoords.length;
    for (let i = 0; i < n; i++) {
      const p0 = pondCoords[(i - 1 + n) % n];
      const p1 = pondCoords[i];
      const p2 = pondCoords[(i + 1) % n];
      const p3 = pondCoords[(i + 2) % n];

      const cp1x = p1.x + (p2.x - p0.x) / 5.5;
      const cp1y = p1.y + (p2.y - p0.y) / 5.5;
      const cp2x = p2.x - (p3.x - p1.x) / 5.5;
      const cp2y = p2.y - (p3.y - p1.y) / 5.5;

      d += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${p2.x} ${p2.y}`;
    }
    return d + ' Z';
  }, [pondCoords]);

  // Bathymetric Depth Contours helper generator
  const createContourPath = (scale: number): string => {
    if (pondCoords.length < 3) return '';
    const centerX = 500;
    const centerY = 350;
    const scaled = pondCoords.map((pt) => ({
      x: Math.round(centerX + (pt.x - centerX) * scale),
      y: Math.round(centerY + (pt.y - centerY) * scale),
    }));

    let d = `M ${scaled[0].x} ${scaled[0].y}`;
    const n = scaled.length;
    for (let i = 0; i < n; i++) {
      const p0 = scaled[(i - 1 + n) % n];
      const p1 = scaled[i];
      const p2 = scaled[(i + 1) % n];
      const p3 = scaled[(i + 2) % n];

      const cp1x = p1.x + (p2.x - p0.x) / 5.5;
      const cp1y = p1.y + (p2.y - p0.y) / 5.5;
      const cp2x = p2.x - (p3.x - p1.x) / 5.5;
      const cp2y = p2.y - (p3.y - p1.y) / 5.5;

      d += ` C ${Math.round(cp1x)} ${Math.round(cp1y)}, ${Math.round(cp2x)} ${Math.round(cp2y)}, ${p2.x} ${p2.y}`;
    }
    return d + ' Z';
  };

  // Depth -1.2m Shelf
  const shelfContourPath = useMemo(() => createContourPath(0.85), [pondCoords]);
  // Depth -2.8m Intermediate Basin
  const midBasinContourPath = useMemo(() => createContourPath(0.68), [pondCoords]);
  // Depth -4.5m Deep Channel
  const deepChannelContourPath = useMemo(() => createContourPath(0.48), [pondCoords]);
  // Depth -6.2m Central Trench
  const trenchContourPath = useMemo(() => createContourPath(0.28), [pondCoords]);

  // Projected waypoints loop
  const patrolCircuitPath = useMemo(() => {
    const pts = selectedSector.waypoints.map(([lat, lng]) => project(lat, lng));
    if (pts.length < 2) return '';
    return pts.reduce((acc, pt, i) => acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`), '') + ' Z';
  }, [selectedSector]);

  // Projected breadcrumb trajectory of primary robot
  const breadcrumbPath = useMemo(() => {
    const pts = history.slice(-25).map((pt) => project(pt.lat, pt.lng));
    if (pts.length < 2) return '';
    return pts.reduce((acc, pt, i) => acc + (i === 0 ? `M ${pt.x} ${pt.y}` : ` L ${pt.x} ${pt.y}`), '');
  }, [history]);

  // Follow active robot if enabled
  useEffect(() => {
    if (followActiveBot && activeRobot) {
      const p = project(activeRobot.lat, activeRobot.lng);
      setPan({
        x: (SVG_W / 2 - p.x) * zoom,
        y: (SVG_H / 2 - p.y) * zoom,
      });
    }
  }, [followActiveBot, activeRobot, zoom]);

  // Mouse pan handlers on map canvas
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(3.5, +(z + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, +(z - 0.25).toFixed(2)));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setFollowActiveBot(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Helper badge for landmarks
  const getLandmarkBadge = (type: string) => {
    switch (type) {
      case 'CPCB_STATION':
        return { label: 'WQMS BUOY', color: '#38bdf8', bg: '#0369a1' };
      case 'CONFLUENCE':
        return { label: 'BIO-WEIR', color: '#34d399', bg: '#065f46' };
      case 'GHAT':
        return { label: 'WETLAND', color: '#10b981', bg: '#047857' };
      case 'BRIDGE':
        return { label: 'MARINA DOCK', color: '#f59e0b', bg: '#b45309' };
      default:
        return { label: 'STATION', color: '#94a3b8', bg: '#334155' };
    }
  };

  // Cardinal direction abbreviations for heading angle
  const getHeadingCardinal = (deg: number): string => {
    const d = (deg % 360 + 360) % 360;
    if (d >= 337.5 || d < 22.5) return 'N';
    if (d >= 22.5 && d < 67.5) return 'NE';
    if (d >= 67.5 && d < 112.5) return 'E';
    if (d >= 112.5 && d < 157.5) return 'SE';
    if (d >= 157.5 && d < 202.5) return 'S';
    if (d >= 202.5 && d < 247.5) return 'SW';
    if (d >= 247.5 && d < 292.5) return 'W';
    return 'NW';
  };

  const currentHeading = Math.round(activeRobot?.heading || 0);
  const currentCardinal = getHeadingCardinal(currentHeading);
  const isManualSteering = activeRobot?.directionMode === 'MANUAL' || !!activeRobot?.isManual;

  // Real-time obstacle detection for active robot in Tapan Dighi
  // Only active when the user is in MANUAL HELM mode. In autonomous mode, warnings and yellow circles are suppressed.
  const obstacleAhead: ObstacleWarning | null = useMemo(() => {
    if (!activeRobot || !isManualSteering) return null;
    return detectObstaclesAhead(activeRobot, safeFleet, selectedSector, 55);
  }, [activeRobot, isManualSteering, safeFleet, selectedSector]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-[#070b14] select-none flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[640px] sm:h-[700px]'
      }`}
    >
      {/* TOP POND HUD CONTROLS */}
      <div className="absolute top-0 inset-x-0 z-30 px-4 py-3 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-transparent flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5 pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Waves className="w-4 h-4 text-cyan-400 animate-pulse pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide">
                TAPAN DIGHI
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold uppercase font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping pointer-events-none" />
                5 Robots Active
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold uppercase font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 pointer-events-none" />
                Real Robot Data
              </span>
              {isManualSteering && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold uppercase font-mono">
                  Manual Helm
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span>Freshwater Lake Basin</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-300">25.2890° N, 88.5830° E</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-medium">Google Maps Overlay</span>
            </div>
          </div>
        </div>

        {/* Quick View Overlays & Layer Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={() => setShowGoogleDetails((v) => !v)}
            title="Toggle Google Maps Roads & Shore Surroundings"
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
              showGoogleDetails
                ? 'bg-slate-800 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Maps</span>
          </button>

          <button
            onClick={() => setShowBathymetry((v) => !v)}
            title="Toggle Bathymetric Depth Soundings & Channel Contours"
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
              showBathymetry
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bathymetry</span>
          </button>

          <button
            onClick={() => setShowTrails((v) => !v)}
            title="Toggle Patrol Paths & Breadcrumbs"
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
              showTrails
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Patrol Trail</span>
          </button>

          <button
            onClick={() => setShowLandmarks((v) => !v)}
            title="Toggle Docks & Eco Landmarks"
            className={`px-2.5 py-1 rounded-xl border text-[11px] font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
              showLandmarks
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Docks & Buoy</span>
          </button>

          <button
            onClick={() => {
              if (onToggleControlPanel) {
                onToggleControlPanel();
              } else {
                setIsSteeringPanelOpen((v) => !v);
              }
            }}
            title="Toggle Robot Control Panel by Side of Map"
            className={`px-3 py-1 rounded-xl border text-[11px] font-mono font-bold transition-all flex items-center gap-1.5 backdrop-blur-md ${
              isControlPanelOpen
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-md shadow-violet-900/30'
                : 'bg-slate-900/90 text-yellow-300 border-yellow-500/50 hover:bg-violet-950'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Control Panel</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-black/40 font-mono text-yellow-300">
              {isControlPanelOpen ? 'Side Dock' : 'Open'}
            </span>
          </button>

          <button
            onClick={() => setFollowActiveBot((v) => !v)}
            title="Auto-Follow Selected Robot"
            className={`p-1.5 rounded-xl border text-[11px] font-mono transition-all backdrop-blur-md ${
              followActiveBot
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white transition-all backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* IN-MAP FORWARD PROXIMITY & OBSTACLE ALERT BANNER */}
      {obstacleAhead && activeRobot && (
        <div className="absolute top-16 inset-x-4 sm:inset-x-8 z-30 pointer-events-auto">
          <div
            className={`rounded-2xl p-3 border backdrop-blur-xl flex items-center justify-between gap-3 shadow-xl transition-all ${
              obstacleAhead.isCritical
                ? 'bg-rose-950/90 border-rose-500/80 text-rose-100 shadow-rose-950/60 animate-pulse'
                : 'bg-yellow-950/90 border-yellow-500/80 text-yellow-100 shadow-yellow-950/50'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                  obstacleAhead.isCritical ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-slate-950'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-extrabold flex items-center gap-2 flex-wrap">
                  <span>
                    {obstacleAhead.isCritical ? 'CRITICAL OBSTACLE DIRECTLY AHEAD' : 'PROXIMITY WARNING IN FRONT'}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.2 rounded-full bg-black/60 text-yellow-300 border border-yellow-400/40 font-bold">
                    {obstacleAhead.distanceMeters} METERS
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-200 truncate">
                  <strong className="text-white">{obstacleAhead.name}</strong> • {obstacleAhead.advisory}
                </div>
              </div>
            </div>
            {onToggleControlPanel && !isControlPanelOpen && (
              <button
                onClick={onToggleControlPanel}
                className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold shrink-0 shadow shadow-violet-900/40 transition-all"
              >
                Open Side Helm
              </button>
            )}
          </div>
        </div>
      )}

      {/* FLOATING ZOOM DOCK */}
      <div className="absolute right-4 top-20 z-30 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset View to Full Pond"
          className="w-9 h-9 rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 transition-all flex items-center justify-center shadow-lg backdrop-blur-md active:scale-95"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* GOOGLE MAPS STYLE NORTH COMPASS ROSE (Top Left) */}
      <div className="absolute left-4 top-20 z-30 hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300 shadow-xl pointer-events-auto">
        {/* Needle pointing north */}
        <div className="w-5 h-5 flex items-center justify-center relative">
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[9px] border-b-rose-500 absolute top-0.5" />
          <div className="w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[9px] border-t-slate-300 absolute bottom-0.5" />
          <span className="text-[7.5px] font-bold text-rose-400 absolute -top-2">N</span>
        </div>
        <div className="border-l border-slate-800 pl-2">
          <div className="text-white font-bold flex items-center gap-1.5">
            <span>{currentHeading}°</span>
            <span className="text-cyan-400">{currentCardinal}</span>
            {isManualSteering && <span className="text-[9px] text-amber-400 font-normal">[MANUAL]</span>}
          </div>
          <div className="text-[9px] text-slate-400">Compass Bearing</div>
        </div>
      </div>

      {/* SVG INTERACTIVE LAKE MAP CANVAS */}
      <div
        className="relative flex-1 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing bg-[#070b14]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isDragging ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          <defs>
            {/* Dark Slate Google Maps terrain background */}
            <linearGradient id="googleMapsTerrain" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#080c16" />
              <stop offset="50%" stopColor="#0a101d" />
              <stop offset="100%" stopColor="#070b14" />
            </linearGradient>

            {/* Deep Hydro-Cyan Pond Water Gradient */}
            <radialGradient id="pondWaterGrad" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#0e3a53" />
              <stop offset="40%" stopColor="#0b2c42" />
              <stop offset="75%" stopColor="#082033" />
              <stop offset="100%" stopColor="#061624" />
            </radialGradient>

            {/* Deep Basin Hydro Gradient */}
            <radialGradient id="deepBasinGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0369a1" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.10" />
            </radialGradient>

            {/* Trench -6.2m gradient */}
            <radialGradient id="trenchGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0369a1" stopOpacity="0.65" />
              <stop offset="80%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0" />
            </radialGradient>

            {/* Google Maps Park Polygon Texture Pattern */}
            <pattern id="parkGrass" width="16" height="16" patternUnits="userSpaceOnUse">
              <circle cx="8" cy="8" r="0.8" fill="#14352b" />
            </pattern>

            {/* High-tech dock wood planks */}
            <pattern id="woodPlanks" width="12" height="6" patternUnits="userSpaceOnUse">
              <rect width="12" height="5" fill="#334155" />
              <line x1="0" y1="5.5" x2="12" y2="5.5" stroke="#1e293b" strokeWidth="0.8" />
            </pattern>

            {/* Trash Boom Hazard Stripe */}
            <pattern id="trashBoomYellow" width="16" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="#eab308" />
              <rect x="8" width="8" height="8" fill="#0f172a" />
            </pattern>

            {/* Forward Sonar Radar Gradient (Safe) */}
            <radialGradient id="sonarSafeGrad" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>

            {/* Forward Sonar Radar Gradient (Obstacle Warning) */}
            <radialGradient id="sonarWarningGrad" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. OUTER TERRAIN SURROUNDINGS (Dark Slate matching website design) */}
          <rect width={SVG_W} height={SVG_H} fill="url(#googleMapsTerrain)" />

          {/* 2. GOOGLE MAPS STYLE DETAILS AROUND THE POND */}
          {showGoogleDetails && (
            <g id="googleMapsDetailsLayer">
              {/* Google Maps Ecological Park Area Boundary */}
              <path
                d="M 60 40 L 940 40 L 960 660 L 40 660 Z"
                fill="#071310"
                stroke="#0e2920"
                strokeWidth="1.5"
                opacity="0.85"
              />
              <path
                d="M 60 40 L 940 40 L 960 660 L 40 660 Z"
                fill="url(#parkGrass)"
                opacity="0.6"
              />

              {/* Park Label (Google Maps styled subdued green text) */}
              <g transform="translate(180, 85)" opacity="0.65">
                <circle cx="-14" cy="-4" r="5" fill="#0f766e" />
                <path d="M -14 -9 L -14 1" stroke="#042f2e" strokeWidth="1.5" />
                <text fill="#2dd4bf" fontSize="9.5" fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.8">
                  TAPAN DIGHI HISTORIC WATER SANCTUARY & FRESHWATER PRESERVE
                </text>
              </g>

              {/* Google Maps Clean Road 1: Lakeview Promenade (Curving along West and North perimeter) */}
              <g id="roadLakeviewRing">
                {/* Road bed */}
                <path
                  d="M 50 280 C 70 160, 180 80, 360 70 C 540 60, 720 75, 880 110 C 930 120, 960 160, 960 220"
                  fill="none"
                  stroke="#172233"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Road surface */}
                <path
                  d="M 50 280 C 70 160, 180 80, 360 70 C 540 60, 720 75, 880 110 C 930 120, 960 160, 960 220"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Center dividing line */}
                <path
                  d="M 50 280 C 70 160, 180 80, 360 70 C 540 60, 720 75, 880 110 C 930 120, 960 160, 960 220"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="8 10"
                />
                {/* Road Label */}
                <text
                  x="560"
                  y="65"
                  fill="#64748b"
                  fontSize="8"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  LAKEVIEW PROMENADE
                </text>
              </g>

              {/* Google Maps Clean Road 2: Harbor Access Road (Entering from South into South Marina) */}
              <g id="roadHarborAccess">
                <path
                  d="M 500 700 L 500 580 L 485 530"
                  fill="none"
                  stroke="#172233"
                  strokeWidth="16"
                  strokeLinecap="round"
                />
                <path
                  d="M 500 700 L 500 580 L 485 530"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                  strokeLinecap="round"
                />
                <path
                  d="M 500 700 L 500 580 L 485 530"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="6 8"
                />
                <text
                  x="512"
                  y="640"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="0.8"
                >
                  HARBOR ACCESS RD
                </text>
              </g>

              {/* Google Maps Clean Road 3: East Bio-Station Drive */}
              <g id="roadEastStationDrive">
                <path
                  d="M 970 360 L 870 350 L 810 350"
                  fill="none"
                  stroke="#172233"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                <path
                  d="M 970 360 L 870 350 L 810 350"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <text
                  x="860"
                  y="342"
                  fill="#64748b"
                  fontSize="7.5"
                  fontFamily="sans-serif"
                  fontWeight="bold"
                  letterSpacing="0.8"
                >
                  DEPOT ACCESS WAY
                </text>
              </g>

              {/* Building Footprint 1: WBPCB Operations Depot (North East) */}
              <g transform="translate(820, 150)" opacity="0.85">
                <rect x="0" y="0" width="55" height="35" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <rect x="4" y="4" width="22" height="12" rx="1.5" fill="#0f172a" />
                <rect x="30" y="4" width="20" height="12" rx="1.5" fill="#0f172a" />
                <text x="27" y="46" fill="#94a3b8" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  WBPCB Marine Depot
                </text>
              </g>

              {/* Building Footprint 2: Marina Harbor Master & Launch Slip (South) */}
              <g transform="translate(420, 560)" opacity="0.85">
                <rect x="0" y="0" width="48" height="28" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <rect x="52" y="2" width="24" height="24" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
                <text x="64" y="16" fill="#38bdf8" fontSize="9" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  P
                </text>
                <text x="36" y="38" fill="#94a3b8" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  Marina Office & Slipway
                </text>
              </g>

              {/* Building Footprint 3: Eco Observation Center & Visitor Deck (West) */}
              <g transform="translate(100, 290)" opacity="0.85">
                <rect x="0" y="0" width="42" height="26" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                <text x="21" y="36" fill="#94a3b8" fontSize="7" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                  Visitor Deck
                </text>
              </g>

              {/* Google Maps Cartographic Scale Bar (Bottom Right) */}
              <g transform="translate(830, 660)" opacity="0.8">
                <rect x="0" y="0" width="120" height="18" rx="4" fill="#020617" fillOpacity="0.8" stroke="#1e293b" strokeWidth="1" />
                {/* 100m bar */}
                <rect x="10" y="5" width="50" height="3" fill="#ffffff" />
                <rect x="60" y="5" width="50" height="3" fill="#64748b" />
                <text x="10" y="15" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">0</text>
                <text x="60" y="15" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">50m</text>
                <text x="110" y="15" fill="#94a3b8" fontSize="6.5" fontFamily="monospace">100m</text>
              </g>

              {/* Google Maps Coordinates / Attribution */}
              <g transform="translate(40, 668)" opacity="0.6">
                <text fill="#64748b" fontSize="7.5" fontFamily="sans-serif">
                  Map data © WBPCB Hydro / AI Studio • 25.2890° N, 88.5830° E • Tapan Dighi Reservoir
                </text>
              </g>
            </g>
          )}

          {/* 3. REINFORCED SLATE EMBANKMENT & SHORELINE BUFFER */}
          <path
            d={pondSmoothPath}
            fill="none"
            stroke="#1e293b"
            strokeWidth="30"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.95"
          />
          <path
            d={pondSmoothPath}
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity="0.8"
          />
          {/* Glowing waterline boundary */}
          <path
            d={pondSmoothPath}
            fill="none"
            stroke="#0891b2"
            strokeWidth="2.5"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* 4. DEEP HYDRO-CYAN POND WATER BODY */}
          <path
            d={pondSmoothPath}
            fill="url(#pondWaterGrad)"
            stroke="#0e7490"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* 5. BATHYMETRIC DEPTH CONTOURS & SOUNDINGS */}
          {showBathymetry && (
            <g id="bathymetryLayer" opacity="0.85">
              {/* -1.2m Shelf Contour */}
              <path
                d={shelfContourPath}
                fill="none"
                stroke="#0891b2"
                strokeWidth="1"
                strokeDasharray="5 4"
                opacity="0.35"
              />
              <text x="310" y="240" fill="#38bdf8" fontSize="7" fontFamily="monospace" opacity="0.65">
                -1.2m
              </text>
              <text x="690" y="460" fill="#38bdf8" fontSize="7" fontFamily="monospace" opacity="0.65">
                -1.2m
              </text>

              {/* -2.8m Intermediate Basin */}
              <path
                d={midBasinContourPath}
                fill="url(#deepBasinGrad)"
                stroke="#0284c7"
                strokeWidth="1.2"
                strokeDasharray="6 5"
                opacity="0.5"
              />
              <text x="370" y="280" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" opacity="0.75">
                -2.8m
              </text>
              <text x="630" y="420" fill="#38bdf8" fontSize="7.5" fontFamily="monospace" opacity="0.75">
                -2.8m
              </text>

              {/* -4.5m Deep Navigation Channel */}
              <path
                d={deepChannelContourPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.4"
                strokeDasharray="8 6"
                opacity="0.45"
              />
              <text x="440" y="320" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.85">
                -4.5m Deep Channel
              </text>

              {/* -6.2m Central Trench */}
              <path
                d={trenchContourPath}
                fill="url(#trenchGrad)"
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.55"
              />
              <text x="475" y="375" fill="#93c5fd" fontSize="7.5" fontFamily="monospace" opacity="0.9">
                -6.2m Trench
              </text>
            </g>
          )}

          {/* 6. MAIN NAVIGATION FAIRWAY & SPEED REGULATION MARKERS */}
          <g id="navigationFairwayLayer" opacity="0.7">
            {/* Centerline corridor */}
            <path
              d="M 280 340 C 380 320, 500 330, 620 360 C 690 380, 740 370, 780 340"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="8 8"
              opacity="0.4"
            />
            {/* Fairway Speed Limit Marker */}
            <g transform="translate(620, 375)">
              <rect x="-28" y="-7" width="56" height="14" rx="4" fill="#020617" fillOpacity="0.8" stroke="#38bdf8" strokeWidth="0.8" />
              <text x="0" y="3" fill="#38bdf8" fontSize="6.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                MAX 4.0 KTS
              </text>
            </g>
          </g>

          {/* 7. HYDRODYNAMIC CIRCULATION SURFACE DRIFT VECTORS */}
          <g id="hydrodynamicVectorsLayer" opacity="0.35">
            {/* Subtle flow arrows */}
            <path d="M 380 260 Q 420 250 460 256" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 456 254 L 460 256 L 454 260" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            <path d="M 580 430 Q 540 440 500 436" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            <path d="M 504 434 L 500 436 L 506 440" stroke="#38bdf8" strokeWidth="1.2" strokeLinecap="round" fill="none" />

            <text x="420" y="246" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">
              0.2 kts surface drift →
            </text>
          </g>

          {/* 8. WATER RIPPLES & ACOUSTIC ACCENTS */}
          <g opacity="0.3">
            <ellipse cx="500" cy="350" rx="140" ry="80" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="8 8" opacity="0.3" />
            <ellipse cx="500" cy="350" rx="75" ry="45" fill="none" stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="6 6" opacity="0.4" />
          </g>

          {/* 9. ECO REEDS & WATER LILY PADS (Wetland Sanctuary at South-West) */}
          <g transform="translate(230, 480)">
            <circle cx="0" cy="0" r="14" fill="#042f2e" stroke="#0f766e" strokeWidth="1.5" />
            <path d="M 0 0 L 12 -4" stroke="#021422" strokeWidth="1.5" />
            <circle cx="2" cy="-2" r="3.5" fill="#f43f5e" />

            <circle cx="26" cy="16" r="12" fill="#064e3b" stroke="#0d9488" strokeWidth="1.5" />
            <circle cx="28" cy="14" r="3" fill="#fb7185" />

            <circle cx="-18" cy="22" r="15" fill="#042f2e" stroke="#0f766e" strokeWidth="1.5" />
            <circle cx="-16" cy="20" r="4" fill="#f43f5e" />

            <circle cx="10" cy="38" r="11" fill="#064e3b" stroke="#0d9488" strokeWidth="1.5" />

            <text x="5" y="60" fill="#5eead4" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
              Lotus Sanctuary (No Wake Zone)
            </text>
          </g>

          {/* 10. FLOATING TRASH BOOM BARRIERS */}
          <g transform="translate(680, 290) rotate(25)">
            <rect x="-40" y="-4" width="80" height="8" rx="4" fill="url(#trashBoomYellow)" stroke="#ffffff" strokeWidth="1.2" />
            <circle cx="-40" cy="0" r="5" fill="#f59e0b" stroke="#000000" strokeWidth="1.2" />
            <circle cx="40" cy="0" r="5" fill="#f59e0b" stroke="#000000" strokeWidth="1.2" />
            <text x="0" y="16" fill="#fef08a" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
              TRASH BOOM BARRIER
            </text>
          </g>

          {/* Debris Patch Alpha (Active target for sweepers) */}
          <g transform="translate(560, 240)">
            <circle cx="0" cy="0" r="9" fill="#ca8a04" opacity="0.75" />
            <circle cx="6" cy="-4" r="5.5" fill="#0284c7" opacity="0.8" />
            <circle cx="-5" cy="5" r="6.5" fill="#eab308" opacity="0.85" />
            <circle cx="0" cy="0" r="16" fill="none" stroke="#eab308" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
            <text x="0" y="24" fill="#fef08a" fontSize="7.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
              Debris Target Alpha (3.8kg)
            </text>
          </g>

          {/* 11. PATROL CIRCUIT & WAYPOINT TRAIL OVERLAY */}
          {showTrails && (
            <g id="patrolTrailsLayer">
              <path
                d={patrolCircuitPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.8"
                strokeDasharray="8 6"
                opacity="0.5"
              />
              {breadcrumbPath && (
                <path
                  d={breadcrumbPath}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.8"
                />
              )}
            </g>
          )}

          {/* 12. SHORELINE DOCKS, STATIONS & WQMS BUOY (Rock-solid, zero vibration, zero throttle) */}
          {showLandmarks &&
            selectedSector.landmarks?.map((lm) => {
              const p = project(lm.coords[0], lm.coords[1]);
              const badge = getLandmarkBadge(lm.type);
              const isCentralBuoy = lm.id === 'lake-central-buoy';
              const isHovered = hoveredLandmarkId === lm.id;

              return (
                <g
                  key={lm.id}
                  transform={`translate(${p.x}, ${p.y})`}
                  className="cursor-pointer"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setActiveInspector({ type: 'landmark', landmark: lm });
                  }}
                  onMouseEnter={() => setHoveredLandmarkId(lm.id)}
                  onMouseLeave={() => setHoveredLandmarkId(null)}
                >
                  {/* Stable stationary hit target (never changes size or triggers jumping) */}
                  <circle cx="0" cy="0" r="30" fill="transparent" pointerEvents="all" className="cursor-pointer" />

                  {isCentralBuoy ? (
                    /* Central Aquatic Water Quality Buoy */
                    <g pointerEvents="none">
                      {/* Decorative sonar wave with pointer-events-none */}
                      <circle
                        cx="0"
                        cy="0"
                        r="24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.35"
                        className="pointer-events-none animate-ping"
                        style={{ animationDuration: '3.5s' }}
                      />
                      {/* Solid Buoy Structure */}
                      <circle
                        cx="0"
                        cy="0"
                        r="15"
                        fill="#0369a1"
                        stroke={isHovered ? '#67e8f9' : '#38bdf8'}
                        strokeWidth={isHovered ? 2.5 : 2}
                      />
                      <circle cx="0" cy="0" r="7" fill="#facc15" />
                      <circle cx="0" cy="0" r="3" fill="#22c55e" />

                      {/* Buoy Tag */}
                      <rect
                        x="-44"
                        y="20"
                        width="88"
                        height="18"
                        rx="6"
                        fill="#020617"
                        fillOpacity="0.95"
                        stroke={isHovered ? '#67e8f9' : '#38bdf8'}
                        strokeWidth={isHovered ? 1.8 : 1}
                      />
                      <text x="0" y="32" fill="#ffffff" fontSize="8.5" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                        WQMS BUOY
                      </text>
                    </g>
                  ) : (
                    /* Tech Dock / Shoreline Facility */
                    <g pointerEvents="none">
                      {/* Dock pier planks */}
                      <rect
                        x="-18"
                        y="-12"
                        width="36"
                        height="24"
                        rx="4"
                        fill="url(#woodPlanks)"
                        stroke="#334155"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx="0"
                        cy="0"
                        r="9"
                        fill={badge.bg}
                        stroke={isHovered ? '#ffffff' : badge.color}
                        strokeWidth={isHovered ? 2.5 : 2}
                      />
                      <circle cx="0" cy="0" r="3" fill="#ffffff" />

                      {/* Facility label tag */}
                      <rect
                        x="-48"
                        y="18"
                        width="96"
                        height="18"
                        rx="6"
                        fill="#020617"
                        fillOpacity="0.95"
                        stroke={isHovered ? '#ffffff' : badge.color}
                        strokeWidth={isHovered ? 1.8 : 1}
                      />
                      <text x="0" y="30" fill="#f8fafc" fontSize="8" fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">
                        {badge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

          {/* 13. ALL 5 ACTIVE AUTONOMOUS FLEET ROBOTS (Direction-Controlled, Stable Click, Heading Vector) */}
          {safeFleet.map((robot) => {
            const p = project(robot.lat, robot.lng);
            const isSelected = selectedRobotId === robot.id;
            const isHovered = hoveredRobotId === robot.id;
            const headingDeg = robot.heading || 0;
            const isRobotManual = robot.directionMode === 'MANUAL' || !!robot.isManual;

            return (
              <g
                key={robot.id}
                transform={`translate(${p.x}, ${p.y})`}
                className="cursor-pointer"
                onMouseDown={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSelectRobot?.(robot.id);
                  setActiveInspector({ type: 'robot', robot });
                }}
                onMouseEnter={() => setHoveredRobotId(robot.id)}
                onMouseLeave={() => setHoveredRobotId(null)}
              >
                {/* Stable stationary hit target (never moves or throttles) */}
                <circle cx="0" cy="0" r="32" fill="transparent" pointerEvents="all" className="cursor-pointer" />

                {/* ACTIVE SELECTION RETICLE */}
                {isSelected && (
                  <g pointerEvents="none">
                    <circle
                      cx="0"
                      cy="0"
                      r="28"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                      className="pointer-events-none animate-spin"
                      style={{ animationDuration: '10s' }}
                    />
                    <circle cx="0" cy="0" r="36" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.35" />
                    {/* Corner targeting brackets */}
                    <path d="M -22 -22 L -28 -22 L -28 -16" stroke="#38bdf8" strokeWidth="2" fill="none" />
                    <path d="M 22 -22 L 28 -22 L 28 -16" stroke="#38bdf8" strokeWidth="2" fill="none" />
                    <path d="M -22 22 L -28 22 L -28 16" stroke="#38bdf8" strokeWidth="2" fill="none" />
                    <path d="M 22 22 L 28 22 L 28 16" stroke="#38bdf8" strokeWidth="2" fill="none" />
                  </g>
                )}

                {/* WATER PROPULSION WAKE (Trails opposite of heading) */}
                <g transform={`rotate(${headingDeg + 180})`} pointerEvents="none">
                  <ellipse cx="0" cy="18" rx="8" ry="14" fill="#ffffff" opacity="0.35" />
                  <ellipse cx="0" cy="28" rx="12" ry="20" fill="#ffffff" opacity="0.2" />
                  <path d="M -8 12 Q -16 28 -24 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
                  <path d="M 8 12 Q 16 28 24 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5" />
                </g>

                {/* ROTATED VESSEL BOAT HULL (Pointing precisely along heading) */}
                <g transform={`rotate(${headingDeg})`} pointerEvents="none">
                  {/* Catamaran Outer Hull */}
                  <path
                    d="M 0 -18 L 12 -4 L 10 14 L -10 14 L -12 -4 Z"
                    fill={robot.color}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2.2' : '1.8'}
                    strokeLinejoin="round"
                  />

                  {/* Dual Skimmer Sweep Arms */}
                  <line x1="-12" y1="-4" x2="-8" y2="-16" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="-4" x2="8" y2="-16" stroke="#facc15" strokeWidth="2" strokeLinecap="round" />

                  {/* Electronics Pod */}
                  <rect x="-6" y="-6" width="12" height="14" rx="3" fill="#0f172a" stroke="#ffffff" strokeWidth="1" />

                  {/* Solar Panel */}
                  <rect x="-4" y="-3" width="8" height="6" rx="1.5" fill="#3b82f6" />
                  <line x1="0" y1="-3" x2="0" y2="3" stroke="#93c5fd" strokeWidth="0.8" />

                  {/* Bow Navigation Beacon */}
                  <circle cx="0" cy="-12" r="2.5" fill="#22c55e" />

                  {/* Twin Thrusters */}
                  <circle cx="-6" cy="14" r="2.2" fill="#0284c7" />
                  <circle cx="6" cy="14" r="2.2" fill="#0284c7" />
                </g>

                {/* CALLSIGN, HEADING & BATTERY PILL BADGE */}
                <g transform="translate(0, -32)" pointerEvents="none">
                  <rect
                    x="-40"
                    y="-9"
                    width="80"
                    height="18"
                    rx="9"
                    fill="#020617"
                    fillOpacity="0.95"
                    stroke={isSelected ? '#38bdf8' : robot.color}
                    strokeWidth={isSelected ? 2 : 1.2}
                  />
                  <text
                    x="0"
                    y="3.5"
                    fill="#ffffff"
                    fontSize="8.5"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {robot.callsign} • {Math.round(headingDeg)}°{isRobotManual ? ' [M]' : ''}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Active 5 fleet robots rendered above */}
        </svg>

        {/* IN-MAP HELM LAUNCHER PILL (Allows user to locate or toggle side control panel) */}
        {activeRobot && (
          <div className="absolute right-4 bottom-16 z-30 pointer-events-auto">
            <button
              onClick={() => {
                if (onToggleControlPanel) {
                  onToggleControlPanel();
                } else {
                  setIsSteeringPanelOpen((v) => !v);
                }
              }}
              title="Locate & Toggle Helm Control Panel (Located by side of map)"
              className="px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-violet-500/40 text-xs font-mono text-white backdrop-blur-xl shadow-xl flex items-center gap-2 hover:bg-violet-950/80 hover:border-violet-400 transition-all active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5 text-yellow-300" />
              <span>Helm: <strong className="text-violet-300">{activeRobot.callsign}</strong></span>
              <span className="text-[9.5px] px-2 py-0.5 rounded-full bg-violet-600/40 text-violet-200 border border-violet-400/30">
                {isControlPanelOpen ? 'Side Panel Active' : 'Show Panel'}
              </span>
            </button>
          </div>
        )}

        {/* FLOATING TELEMETRY CARD FOR CLICKED ROBOT OR LANDMARK (Left Side) */}
        {activeInspector && (
          <div
            className="absolute left-4 bottom-16 z-40 w-72 sm:w-80 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-4 text-white backdrop-blur-xl pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {activeInspector.type === 'robot' ? (
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{
                        backgroundColor: activeInspector.robot.color,
                        boxShadow: `0 0 10px ${activeInspector.robot.color}`,
                      }}
                    />
                    <div>
                      <div className="text-sm font-bold text-white tracking-tight">
                        {activeInspector.robot.name}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {activeInspector.robot.callsign} • {isManualSteering ? 'Manual Helm' : 'Autonomous Patrol'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveInspector(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Battery & Solar Metrics */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div className="text-[9.5px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      Battery Reserve
                    </div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {activeInspector.robot.battery}%
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80">
                    <div className="text-[9.5px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-400" />
                      Solar Inflow
                    </div>
                    <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                      {activeInspector.robot.solarWatts} <span className="text-xs text-slate-400">W</span>
                    </div>
                  </div>
                </div>

                {/* Trash Harvested Load Progress */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Trash2 className="w-3 h-3 text-cyan-400" />
                      Skimmed Payload
                    </span>
                    <span className="font-bold text-cyan-300">
                      {activeInspector.robot.trashCollectedKg.toFixed(1)} / {activeInspector.robot.trashCapacityKg} kg
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (activeInspector.robot.trashCollectedKg / activeInspector.robot.trashCapacityKg) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Water Probes Matrix */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
                  <div className="text-[9.5px] font-bold text-cyan-400 font-mono tracking-wider flex items-center justify-between">
                    <span>LIVE HYDROCHEMICAL SENSORS</span>
                    <span className="text-emerald-400 text-[8.5px]">● CALIBRATED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-center font-mono">
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[8.5px] text-slate-400 block">pH</span>
                      <strong className="text-xs text-emerald-400">{currentPoint.ph.toFixed(2)}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[8.5px] text-slate-400 block">Turbidity</span>
                      <strong className="text-xs text-cyan-400">{currentPoint.turbidity.toFixed(1)}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[8.5px] text-slate-400 block">Temp</span>
                      <strong className="text-xs text-amber-400">{currentPoint.temperature.toFixed(1)}°C</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Navigation Specs & Quick Direction Controls */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-1">
                  <span>
                    Heading: <strong className="text-white">{Math.round(activeInspector.robot.heading)}° {getHeadingCardinal(activeInspector.robot.heading)}</strong>
                  </span>
                  <span>
                    Speed: <strong className="text-white">{activeInspector.robot.speedKnots.toFixed(1)} kts</strong>
                  </span>
                </div>
              </div>
            ) : (
              /* Landmark Inspector */
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <div className="text-sm font-bold text-white tracking-tight">
                      {activeInspector.landmark.name}
                    </div>
                    {activeInspector.landmark.hindiName && (
                      <div className="text-[10px] text-cyan-400 font-sans">
                        {activeInspector.landmark.hindiName}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveInspector(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {activeInspector.landmark.description}
                </p>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {activeInspector.landmark.coords[0].toFixed(4)}°N, {activeInspector.landmark.coords[1].toFixed(4)}°E
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM FLEET DOCK BAR (Quick vessel selection) */}
      <div className="z-30 px-3 py-2 bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-xl flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {safeFleet.map((robot) => {
            const isSelected = selectedRobotId === robot.id;
            const isRobotManual = robot.directionMode === 'MANUAL' || !!robot.isManual;
            return (
              <button
                key={robot.id}
                onClick={() => {
                  onSelectRobot?.(robot.id);
                  setActiveInspector({ type: 'robot', robot });
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono transition-all flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-white border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: robot.color, boxShadow: `0 0 6px ${robot.color}` }}
                />
                <span className="font-bold">{robot.callsign}</span>
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-cyan-300">{Math.round(robot.heading)}°</span>
                {isRobotManual && <span className="text-[9px] text-amber-400 font-bold">[M]</span>}
                <span className="text-[10px] text-slate-500">•</span>
                <span className="text-[10px] text-emerald-400">{robot.battery}%</span>
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-slate-300 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse pointer-events-none" />
          <span>5 Vessels Active</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-300">Verified Robot Telemetry • Tapan Dighi</span>
        </div>
      </div>
    </div>
  );
};
