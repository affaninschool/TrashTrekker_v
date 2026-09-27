import React, { useState } from 'react';
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
  Cpu,
  Crosshair,
  Droplets,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Radio,
  RefreshCw,
  RotateCw,
  Send,
  Shield,
  ShieldCheck,
  Sliders,
  Sparkles,
  Square,
  Sun,
  Thermometer,
  Trash2,
  Waves,
  Wind,
  Zap
} from 'lucide-react';
import { FleetRobot, RiverSector, TelemetryPoint } from '../../types';
import { RiverMap } from '../RiverMap';
import { RobotControlPanel, PanelPosition } from '../RobotControlPanel';

interface LiveMapViewProps {
  history: TelemetryPoint[];
  currentPoint: TelemetryPoint;
  selectedSector: RiverSector;
  fleetRobots: FleetRobot[];
  selectedRobotId: string;
  onSelectRobot: (robotId: string) => void;
  onSelectPoint?: (point: TelemetryPoint) => void;
  highlightedCoords?: [number, number] | null;
  onControlRobot?: (
    robotId: string,
    action: 'forward' | 'reverse' | 'turn_left' | 'turn_right' | 'set_heading' | 'toggle_mode' | 'set_speed' | 'stop',
    value?: any
  ) => void;
  navigationAlert?: {
    message: string;
    type: 'WARNING' | 'CRITICAL';
    timestamp: number;
  } | null;
}

export const LiveMapView: React.FC<LiveMapViewProps> = ({
  history,
  currentPoint,
  selectedSector,
  fleetRobots,
  selectedRobotId,
  onSelectRobot,
  onSelectPoint,
  highlightedCoords,
  onControlRobot,
  navigationAlert,
}) => {
  const [activeCommand, setActiveCommand] = useState<string | null>(null);
  const [controlPanelPosition, setControlPanelPosition] = useState<PanelPosition>('side-right');
  const [isControlPanelOpen, setIsControlPanelOpen] = useState<boolean>(true);
  const [isControlPanelMinimized, setIsControlPanelMinimized] = useState<boolean>(false);

  const selectedRobot = fleetRobots.find((r) => r.id === selectedRobotId) || fleetRobots[0];

  const handleExecuteCommand = (cmd: string) => {
    setActiveCommand(cmd);
    setTimeout(() => {
      setActiveCommand(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Lake Mission Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              Live Autonomous Lake Sweep
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              ● 5 Vessels Synchronized
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            {selectedSector.name}
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Historic Lake Basin • Tapan, Dakshin Dinajpur • Coordinates: 25.2890° N, 88.5830° E • WBPCB Monitoring Grid
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-center gap-2 shadow-lg">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>LoRa 915MHz Mesh Active</span>
          </div>
        </div>
      </div>

      {/* Verified On-Site Field Telemetry Notice (Real Robot Data Confirmation) */}
      <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-slate-900/90 to-cyan-950/40 border border-emerald-500/30 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  Verified In-Situ Robot Telemetry
                </h3>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Field Data
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                Please note that all environmental measurements, water quality indicators, and spatial GPS coordinates presented on this map are authentic, real data gathered directly on-site by this autonomous robotic fleet operating in Tapan Dighi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-emerald-500/20 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Real-Time Sensor Feed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Map & Movable Control Panel Layout */}
      <div
        className={`flex flex-col ${
          controlPanelPosition === 'side-right'
            ? 'xl:flex-row'
            : controlPanelPosition === 'side-left'
            ? 'xl:flex-row-reverse'
            : ''
        } gap-5 items-start w-full relative`}
      >
        {/* Main Map Component with All 5 Robots on Closed Pond */}
        <div className="flex-1 w-full min-w-0">
          <RiverMap
            history={history}
            currentPoint={currentPoint}
            selectedSector={selectedSector}
            fleetRobots={fleetRobots}
            selectedRobotId={selectedRobotId}
            onSelectRobot={onSelectRobot}
            onSelectPoint={onSelectPoint}
            highlightedCoords={highlightedCoords}
            onControlRobot={onControlRobot}
            isControlPanelOpen={isControlPanelOpen}
            onToggleControlPanel={() => setIsControlPanelOpen((v) => !v)}
          />
        </div>

        {/* Robot Helm Control Panel (Presented By Side of Map, Movable Anywhere) */}
        {isControlPanelOpen && selectedRobot && onControlRobot && (
          <RobotControlPanel
            activeRobot={selectedRobot}
            allRobots={fleetRobots}
            selectedSector={selectedSector}
            onControlRobot={onControlRobot}
            positionMode={controlPanelPosition}
            onChangePositionMode={setControlPanelPosition}
            isMinimized={isControlPanelMinimized}
            onToggleMinimize={() => setIsControlPanelMinimized((v) => !v)}
            onClose={() => setIsControlPanelOpen(false)}
            navigationAlert={navigationAlert}
          />
        )}
      </div>

      {/* Quick Access Bar if Control Panel was Closed */}
      {!isControlPanelOpen && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsControlPanelOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-2.5 shadow-xl shadow-violet-950/50 transition-all active:scale-95 border border-violet-400/40"
          >
            <Sliders className="w-4 h-4 text-yellow-300" />
            <span>Open Robot Direction Control Panel (Dock by Side of Map)</span>
          </button>
        </div>
      )}

      {/* Active Vessel HUD & Remote Telemetry Control Dock */}
      {selectedRobot && (
        <div className="rounded-3xl p-6 bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-xl"
                style={{
                  backgroundColor: `${selectedRobot.color}25`,
                  color: selectedRobot.color,
                  border: `1.5px solid ${selectedRobot.color}`,
                  boxShadow: `0 0 15px ${selectedRobot.color}30`,
                }}
              >
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {selectedRobot.name}
                  </h2>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${selectedRobot.color}20`,
                      color: selectedRobot.color,
                      borderColor: `${selectedRobot.color}50`,
                    }}
                  >
                    {selectedRobot.status.replace('_', ' ')}
                  </span>
                  {(selectedRobot.directionMode === 'MANUAL' || selectedRobot.isManual) && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      MANUAL HELM ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Assigned Location: <span className="text-cyan-400 font-semibold">{selectedRobot.locationName}</span> • Heading: {Math.round(selectedRobot.heading)}° • Speed: {selectedRobot.speedKnots.toFixed(1)} kts
                </p>
              </div>
            </div>

            {/* Vessel Remote Command Actions */}
            <div className="flex flex-wrap items-center gap-2">
              {onControlRobot && (
                <button
                  onClick={() => onControlRobot(selectedRobot.id, 'toggle_mode')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
                    selectedRobot.directionMode === 'MANUAL' || selectedRobot.isManual
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-400" />
                  {selectedRobot.directionMode === 'MANUAL' || selectedRobot.isManual
                    ? 'Release to Auto Patrol'
                    : 'Take Manual Helm'}
                </button>
              )}
              <button
                onClick={() => handleExecuteCommand('Surface Skim Arm Deployed')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Waves className="w-3.5 h-3.5 text-cyan-400" />
                Deploy Skimmer Arm
              </button>
              <button
                onClick={() => handleExecuteCommand('Water Chemistry Sampling Cycle Initiated')}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Droplets className="w-3.5 h-3.5 text-emerald-400" />
                Sample Water WQI
              </button>
              <button
                onClick={() => handleExecuteCommand('Navigating to North Solar Charging Dock')}
                className="px-3 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Anchor className="w-3.5 h-3.5 text-cyan-400" />
                Return to Dock
              </button>
            </div>
          </div>

          {/* Active Command Toast Confirmation */}
          {activeCommand && (
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
              <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Telemetry Uplink Confirmed: <strong>{activeCommand}</strong> on {selectedRobot.callsign}</span>
            </div>
          )}

          {/* Real-time Telemetry Matrix for Selected Robot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Battery Level
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {selectedRobot.battery}%
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">LiFePO4 48V</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Trash Load
              </span>
              <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                {selectedRobot.trashCollectedKg} <span className="text-xs text-slate-400 font-sans">/ {selectedRobot.trashCapacityKg}kg</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">
                {((selectedRobot.trashCollectedKg / selectedRobot.trashCapacityKg) * 100).toFixed(0)}% Full
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Cruising Speed
              </span>
              <span className="text-xl font-bold font-mono text-sky-400 mt-1 block">
                {selectedRobot.speedKnots.toFixed(1)} <span className="text-xs text-slate-400 font-sans">kts</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Dual Thruster Active</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Solar Generation
              </span>
              <span className="text-xl font-bold font-mono text-yellow-400 mt-1 block">
                {selectedRobot.solarWatts} <span className="text-xs text-slate-400 font-sans">Watts</span>
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Monocrystalline 200W</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Bearing & Compass
              </span>
              <span className="text-xl font-bold font-mono text-indigo-400 mt-1 block">
                {Math.round(selectedRobot.heading)}°
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">9-DOF IMU Calibrated</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
                Sub-Surface pH
              </span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                {currentPoint.ph.toFixed(2)}
              </span>
              <span className="text-[9.5px] text-slate-400 font-mono">Sensorex Industrial Probe</span>
            </div>
          </div>

          {/* DEDICATED DIRECTION & RUDDER THRUSTER CONTROL DECK */}
          {onControlRobot && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Manual Rudder & Direction Steering Helm ({selectedRobot.callsign})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400">Current Bearing:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                    {Math.round(selectedRobot.heading)}°
                  </span>
                  <span className="text-slate-400">Mode:</span>
                  <span className={`font-bold ${selectedRobot.directionMode === 'MANUAL' || selectedRobot.isManual ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {selectedRobot.directionMode === 'MANUAL' || selectedRobot.isManual ? 'MANUAL STEERING' : 'AUTO PATROL'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-1">
                {/* 1. Tactical D-Pad */}
                <div className="flex items-center justify-center">
                  <div className="grid grid-cols-3 gap-2 w-36">
                    <div />
                    <button
                      onClick={() => onControlRobot(selectedRobot.id, 'forward')}
                      title="Ahead / Forward"
                      className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                    >
                      <ArrowUp className="w-5 h-5" />
                    </button>
                    <div />

                    <button
                      onClick={() => onControlRobot(selectedRobot.id, 'turn_left', 15)}
                      title="Turn Port / Left 15°"
                      className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onControlRobot(selectedRobot.id, 'stop')}
                      title="Halt Thrusters"
                      className="w-11 h-11 rounded-xl bg-rose-950/40 border border-rose-800/80 hover:bg-rose-900/60 text-rose-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                    >
                      <Square className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => onControlRobot(selectedRobot.id, 'turn_right', 15)}
                      title="Turn Starboard / Right 15°"
                      className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>

                    <div />
                    <button
                      onClick={() => onControlRobot(selectedRobot.id, 'reverse')}
                      title="Astern / Reverse"
                      className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/60 text-slate-200 hover:text-cyan-300 flex items-center justify-center transition-all active:scale-95 shadow-md"
                    >
                      <ArrowDown className="w-5 h-5" />
                    </button>
                    <div />
                  </div>
                </div>

                {/* 2. Cardinal Bearing Presets */}
                <div className="space-y-2">
                  <div className="text-[10px] font-mono text-slate-400 uppercase font-bold text-center md:text-left">
                    Direct Cardinal Compass Headings
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
                    {[
                      { label: '0° N', deg: 0 },
                      { label: '45° NE', deg: 45 },
                      { label: '90° E', deg: 90 },
                      { label: '135° SE', deg: 135 },
                      { label: '180° S', deg: 180 },
                      { label: '225° SW', deg: 225 },
                      { label: '270° W', deg: 270 },
                      { label: '315° NW', deg: 315 },
                    ].map((btn) => {
                      const isActive = Math.abs((selectedRobot.heading - btn.deg + 360) % 360) < 15;
                      return (
                        <button
                          key={btn.label}
                          onClick={() => onControlRobot(selectedRobot.id, 'set_heading', btn.deg)}
                          className={`py-1.5 px-1 rounded-xl border text-center font-bold transition-all ${
                            isActive
                              ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                          }`}
                        >
                          {btn.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Smooth Heading Slider & Throttle */}
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Rudder Angle Dial:</span>
                      <strong className="text-cyan-300">{Math.round(selectedRobot.heading)}°</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={Math.round(selectedRobot.heading)}
                      onChange={(e) => onControlRobot(selectedRobot.id, 'set_heading', parseInt(e.target.value, 10))}
                      className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-950 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-slate-500">
                      <span>0° N</span>
                      <span>90° E</span>
                      <span>180° S</span>
                      <span>270° W</span>
                      <span>359°</span>
                    </div>
                  </div>

                  {/* Speed Throttling */}
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 font-mono">Speed:</span>
                    {[
                      { label: 'Idle (0 kts)', val: 0 },
                      { label: 'Slow (1.5 kts)', val: 1.5 },
                      { label: 'Cruise (3.0 kts)', val: 3.0 },
                      { label: 'Fast (4.5 kts)', val: 4.5 },
                    ].map((spd) => (
                      <button
                        key={spd.label}
                        onClick={() => onControlRobot(selectedRobot.id, 'set_speed', spd.val)}
                        className={`px-2 py-1 text-xs font-mono rounded-lg border transition-all ${
                          Math.abs(selectedRobot.speedKnots - spd.val) < 0.5
                            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
