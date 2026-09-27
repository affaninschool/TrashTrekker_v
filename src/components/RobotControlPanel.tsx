import React, { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Battery,
  Bot,
  Compass,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Move,
  Navigation,
  PanelLeftClose,
  PanelRightClose,
  Radio,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Sun,
  Waves,
  X,
  Zap
} from 'lucide-react';
import { FleetRobot, RiverSector } from '../types';
import {
  detectObstaclesAhead,
  getDistanceToPondShoreMeters,
  ObstacleWarning
} from '../utils/navigation';

export type PanelPosition = 'side-right' | 'side-left' | 'floating';

interface RobotControlPanelProps {
  activeRobot: FleetRobot;
  allRobots: FleetRobot[];
  selectedSector: RiverSector;
  onControlRobot: (
    robotId: string,
    action: 'forward' | 'reverse' | 'turn_left' | 'turn_right' | 'set_heading' | 'toggle_mode' | 'set_speed' | 'stop',
    value?: any
  ) => void;
  positionMode: PanelPosition;
  onChangePositionMode: (mode: PanelPosition) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
  navigationAlert?: { message: string; type: 'WARNING' | 'CRITICAL'; timestamp: number } | null;
}

export const RobotControlPanel: React.FC<RobotControlPanelProps> = ({
  activeRobot,
  allRobots,
  selectedSector,
  onControlRobot,
  positionMode,
  onChangePositionMode,
  isMinimized = false,
  onToggleMinimize,
  onClose,
  navigationAlert,
}) => {
  // Draggable state for floating mode
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initX: number; initY: number }>({
    startX: 0,
    startY: 0,
    initX: 0,
    initY: 0,
  });

  const isManualSteering = activeRobot.directionMode === 'MANUAL' || activeRobot.isManual;
  const currentHeading = Math.round(activeRobot.heading ?? 0);

  // Calculate distance to shoreline for active robot
  const polygon = selectedSector.pondPolygon || selectedSector.waypoints;
  const shoreDistance = Math.round(getDistanceToPondShoreMeters(activeRobot.lat, activeRobot.lng, polygon));

  // Detect forward obstacles - only active in manual helm mode (suppressed in autonomous mode)
  const obstacle: ObstacleWarning | null = isManualSteering
    ? detectObstaclesAhead(activeRobot, allRobots, selectedSector, 50)
    : null;

  // Convert heading to cardinal text
  const currentCardinal =
    currentHeading >= 337.5 || currentHeading < 22.5 ? 'N'
    : currentHeading >= 22.5 && currentHeading < 67.5 ? 'NE'
    : currentHeading >= 67.5 && currentHeading < 112.5 ? 'E'
    : currentHeading >= 112.5 && currentHeading < 157.5 ? 'SE'
    : currentHeading >= 157.5 && currentHeading < 202.5 ? 'S'
    : currentHeading >= 202.5 && currentHeading < 247.5 ? 'SW'
    : currentHeading >= 247.5 && currentHeading < 292.5 ? 'W'
    : 'NW';

  // Handle Dragging in floating mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (positionMode !== 'floating') return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: dragOffset.x,
      initY: dragOffset.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (positionMode !== 'floating') return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        initX: dragOffset.x,
        initY: dragOffset.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      setDragOffset({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy,
      });
    };

    const handleMouseUp = () => {
      if (isDragging) setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.startX;
      const dy = e.touches[0].clientY - dragStartRef.current.startY;
      setDragOffset({
        x: dragStartRef.current.initX + dx,
        y: dragStartRef.current.initY + dy,
      });
    };

    const handleTouchEnd = () => {
      if (isDragging) setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <aside
      id="robot-control-panel"
      aria-label="Robot Helm Control Panel"
      className={`transition-shadow duration-200 select-none ${
        positionMode === 'floating'
          ? 'fixed z-50 w-80 sm:w-96 shadow-2xl shadow-violet-950/50'
          : 'w-full lg:w-88 xl:w-96 shrink-0 shadow-xl'
      } rounded-3xl bg-[#090e17]/95 border border-violet-500/30 text-white backdrop-blur-2xl flex flex-col`}
      style={
        positionMode === 'floating'
          ? {
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
              top: '120px',
              right: '24px',
            }
          : undefined
      }
    >
      {/* PANEL TOP BAR & DRAG HANDLE */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className={`px-4 py-3 border-b border-violet-500/20 bg-gradient-to-r from-violet-950/50 via-slate-900/80 to-emerald-950/40 rounded-t-3xl flex items-center justify-between gap-2 ${
          positionMode === 'floating' ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex items-center gap-2.5">
          {positionMode === 'floating' && (
            <div className="p-1 rounded-md bg-violet-500/20 text-violet-300">
              <Move className="w-3.5 h-3.5" />
            </div>
          )}
          <div
            className="w-3.5 h-3.5 rounded-full ring-2 ring-violet-400/40"
            style={{
              backgroundColor: activeRobot.color || '#8b5cf6',
              boxShadow: `0 0 10px ${activeRobot.color || '#8b5cf6'}`,
            }}
          />
          <div>
            <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
              <span>{activeRobot.callsign} Command Helm</span>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-wider ${
                  isManualSteering
                    ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {isManualSteering ? 'MANUAL HELM' : 'AUTO PATROL'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2">
              <span className="text-violet-300 font-semibold">{activeRobot.name.split('(')[0].trim()}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{activeRobot.battery}% Batt</span>
            </div>
          </div>
        </div>

        {/* Action icons & Dock controls */}
        <div className="flex items-center gap-1">
          {/* Position Mode Selector */}
          <div className="flex items-center bg-slate-950/70 p-0.5 rounded-xl border border-violet-500/25">
            <button
              onClick={() => onChangePositionMode('side-right')}
              title="Dock by Right Side of Map"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                positionMode === 'side-right'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PanelRightClose className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangePositionMode('side-left')}
              title="Dock by Left Side of Map"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                positionMode === 'side-left'
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangePositionMode('floating')}
              title="Free Floating (Drag Anywhere)"
              className={`p-1.5 rounded-lg text-xs transition-all ${
                positionMode === 'floating'
                  ? 'bg-yellow-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
            </button>
          </div>

          {onToggleMinimize && (
            <button
              onClick={onToggleMinimize}
              title={isMinimized ? 'Expand Helm' : 'Collapse Helm'}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              title="Close Helm Panel"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto custom-scroll">
          {/* LORAS & POSITION TELEMETRY STRIP */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Compass className="w-3 h-3 text-violet-400" />
                Heading
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                {currentHeading}° <span className="text-violet-400 font-mono">{currentCardinal}</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                Speed
              </div>
              <div className="text-sm font-extrabold text-yellow-300 mt-0.5">
                {activeRobot.speedKnots.toFixed(1)} <span className="text-[10px] text-slate-400">kts</span>
              </div>
            </div>

            <div className="p-2 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="text-[9px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                <Sun className="w-3 h-3 text-emerald-400" />
                Solar
              </div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">
                {activeRobot.solarWatts}W
              </div>
            </div>
          </div>

          {/* LAKE WATER CONTAINMENT INDICATOR (Pond Boundary Safety) */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              shoreDistance <= 10
                ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30'
                : shoreDistance <= 22
                ? 'bg-yellow-950/30 border-yellow-500/50 shadow-md shadow-yellow-950/20'
                : 'bg-emerald-950/20 border-emerald-500/30'
            }`}
          >
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold ${
                    shoreDistance <= 10
                      ? 'bg-rose-500/20 text-rose-400'
                      : shoreDistance <= 22
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}
                >
                  <Waves className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Tapan Dighi Containment</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono bg-white/10 text-white">
                      Locked In-Pond
                    </span>
                  </div>
                  <div className="text-[10.5px] font-mono text-slate-300">
                    Distance to Shore: <strong className={shoreDistance <= 10 ? 'text-rose-400' : shoreDistance <= 22 ? 'text-yellow-300' : 'text-emerald-400'}>{shoreDistance}m</strong>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-[9.5px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${
                    shoreDistance <= 10
                      ? 'bg-rose-500 text-white'
                      : shoreDistance <= 22
                      ? 'bg-yellow-400 text-slate-950'
                      : 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                  }`}
                >
                  {shoreDistance <= 10 ? 'Near Edge' : shoreDistance <= 22 ? 'Caution' : 'Safe Water'}
                </span>
              </div>
            </div>
            {shoreDistance <= 10 && (
              <p className="text-[10px] text-rose-300 mt-2 font-mono leading-tight">
                ⚠️ Shore proximity safety active: Thrusters will auto-block forward movement out of the lake water!
              </p>
            )}
          </div>

          {/* PROXIMITY & OBSTACLE DETECTION WARNING SYSTEM */}
          {obstacle ? (
            <div
              className={`p-3.5 rounded-2xl border animate-pulse transition-all ${
                obstacle.isCritical
                  ? 'bg-gradient-to-r from-rose-950/60 to-yellow-950/50 border-rose-400/80 shadow-lg shadow-rose-900/40'
                  : 'bg-gradient-to-r from-yellow-950/50 to-amber-950/40 border-yellow-400/70 shadow-md shadow-yellow-900/20'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold mt-0.5 ${
                    obstacle.isCritical ? 'bg-rose-500 text-white' : 'bg-yellow-400 text-slate-950'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-extrabold text-white uppercase tracking-wide">
                      {obstacle.isCritical ? 'CRITICAL OBSTACLE AHEAD' : 'PROXIMITY WARNING'}
                    </span>
                    <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-slate-950/80 text-yellow-300 border border-yellow-400/40">
                      {obstacle.distanceMeters} METERS
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold text-white">
                    {obstacle.name}
                  </div>
                  <div className="text-[10px] font-mono text-yellow-200 leading-snug">
                    {obstacle.advisory}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sonar Scan: Forward Path Clear (50m)</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          )}

          {/* RECENT NAVIGATION ALERTS */}
          {navigationAlert && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 text-xs font-mono flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{navigationAlert.message}</div>
            </div>
          )}

          {/* MODE SWITCHER BUTTON */}
          <div className="pt-1">
            <button
              onClick={() => onControlRobot(activeRobot.id, 'toggle_mode')}
              className={`w-full py-2.5 px-4 rounded-2xl text-xs font-mono font-extrabold border transition-all flex items-center justify-center gap-2 shadow-lg ${
                isManualSteering
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 border-yellow-300 shadow-yellow-500/25 active:scale-98'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-violet-400/50 shadow-violet-600/30 active:scale-98'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {isManualSteering ? 'Switch to Autonomous Route Patrol' : 'Take Manual Directional Helm'}
            </button>
          </div>

          {/* TACTILE DIRECTION D-PAD */}
          <div className="p-3.5 rounded-3xl bg-slate-950/80 border border-slate-800/90 shadow-inner">
            <div className="text-[10px] uppercase font-bold text-slate-400 font-mono mb-2 flex items-center justify-between">
              <span>Tactile Helm Controls</span>
              <span className="text-violet-400 font-normal">Active: {activeRobot.callsign}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* D-Pad Buttons */}
              <div className="grid grid-cols-3 gap-2 w-36 shrink-0 mx-auto">
                <div />
                <button
                  onClick={() => onControlRobot(activeRobot.id, 'forward')}
                  title="Thrust Forward (ArrowUp / W)"
                  className="w-11 h-11 rounded-2xl bg-gradient-to-b from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 text-white border border-violet-400/40 flex items-center justify-center shadow-lg shadow-violet-900/40 transition-all active:scale-90"
                >
                  <ArrowUp className="w-5 h-5 font-bold" />
                </button>
                <div />

                <button
                  onClick={() => onControlRobot(activeRobot.id, 'turn_left', 15)}
                  title="Turn Port / Left 15° (ArrowLeft / A)"
                  className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-violet-950 text-slate-200 hover:text-violet-300 border border-slate-700 hover:border-violet-500 flex items-center justify-center transition-all active:scale-90"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onControlRobot(activeRobot.id, 'stop')}
                  title="Halt Thrusters (Spacebar)"
                  className="w-11 h-11 rounded-2xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-600/80 flex items-center justify-center shadow-lg shadow-rose-950/50 transition-all active:scale-90"
                >
                  <Square className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => onControlRobot(activeRobot.id, 'turn_right', 15)}
                  title="Turn Starboard / Right 15° (ArrowRight / D)"
                  className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-violet-950 text-slate-200 hover:text-violet-300 border border-slate-700 hover:border-violet-500 flex items-center justify-center transition-all active:scale-90"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div />
                <button
                  onClick={() => onControlRobot(activeRobot.id, 'reverse')}
                  title="Reverse / Astern (ArrowDown / S)"
                  className="w-11 h-11 rounded-2xl bg-slate-900 hover:bg-violet-950 text-slate-200 hover:text-violet-300 border border-slate-700 hover:border-violet-500 flex items-center justify-center transition-all active:scale-90"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <div />
              </div>

              {/* Cardinal Presets */}
              <div className="flex-1 w-full space-y-2">
                <div className="text-[9.5px] font-mono text-slate-400 uppercase font-bold">
                  Cardinal Bearings
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
                  {[
                    { label: 'N', deg: 0 },
                    { label: 'NE', deg: 45 },
                    { label: 'E', deg: 90 },
                    { label: 'SE', deg: 135 },
                    { label: 'S', deg: 180 },
                    { label: 'SW', deg: 225 },
                    { label: 'W', deg: 270 },
                    { label: 'NW', deg: 315 },
                  ].map((card) => {
                    const isBearingActive = Math.abs((currentHeading - card.deg + 360) % 360) < 15;
                    return (
                      <button
                        key={card.label}
                        onClick={() => onControlRobot(activeRobot.id, 'set_heading', card.deg)}
                        className={`py-1 rounded-xl border text-center font-bold transition-all ${
                          isBearingActive
                            ? 'bg-yellow-400 text-slate-950 border-yellow-300 shadow-md shadow-yellow-500/20'
                            : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:border-violet-500'
                        }`}
                      >
                        {card.label}
                      </button>
                    );
                  })}
                </div>

                {/* Speed Throttle Presets */}
                <div className="flex items-center gap-1 pt-1">
                  <span className="text-[9.5px] text-slate-400 font-mono">Speed:</span>
                  {[
                    { label: '1.5 kts', val: 1.5 },
                    { label: '3.0 kts', val: 3.0 },
                    { label: '4.5 kts', val: 4.5 },
                  ].map((spd) => (
                    <button
                      key={spd.label}
                      onClick={() => onControlRobot(activeRobot.id, 'set_speed', spd.val)}
                      className={`flex-1 py-1 text-[10px] font-mono rounded-xl border transition-all ${
                        Math.abs(activeRobot.speedKnots - spd.val) < 0.5
                          ? 'bg-violet-600 text-white border-violet-400 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SMOOTH COMPASS HEADING SLIDER */}
            <div className="mt-3.5 pt-3 border-t border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-violet-400" />
                  Rudder Angle Dial:
                </span>
                <span className="text-yellow-300 font-bold font-mono">
                  {currentHeading}° {currentCardinal}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="359"
                value={currentHeading}
                onChange={(e) => onControlRobot(activeRobot.id, 'set_heading', parseInt(e.target.value, 10))}
                className="w-full accent-violet-400 cursor-pointer h-2 bg-slate-800 rounded-lg appearance-none"
              />
              <div className="flex justify-between text-[8px] font-mono text-slate-500">
                <span>0° N</span>
                <span>90° E</span>
                <span>180° S</span>
                <span>270° W</span>
                <span>359°</span>
              </div>
            </div>
          </div>

          {/* Keyboard tip & movability instruction */}
          <div className="text-[10px] font-mono text-slate-400 bg-slate-900/60 p-2.5 rounded-2xl border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-slate-300">
              <span>⌨️ Keyboard:</span>
              <span className="text-white font-semibold">↑ W / ↓ S / ← A / → D / Space</span>
            </div>
            <div className="text-[9px] text-violet-300/80 flex items-center gap-1">
              <Move className="w-3 h-3 text-violet-400 shrink-0" />
              <span>Tip: Click "Float" on top to drag this panel anywhere on screen!</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
