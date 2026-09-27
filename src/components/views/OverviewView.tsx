import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Battery,
  Bot,
  CheckCircle,
  Compass,
  Cpu,
  Droplets,
  ExternalLink,
  Flame,
  Gauge,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  Radio,
  RefreshCw,
  RotateCw,
  Shield,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  TrendingUp,
  Waves,
  Wind,
  Zap
} from 'lucide-react';
import { DashboardTab, FleetRobot, RiverSector, TelemetryPoint } from '../../types';
import { SensorGrid } from '../SensorGrid';

interface OverviewViewProps {
  currentPoint: TelemetryPoint;
  history: TelemetryPoint[];
  totalTrashKg: number;
  recentTrashGained: number;
  selectedSector: RiverSector;
  fleetRobots: FleetRobot[];
  selectedRobotId: string;
  onSelectRobot: (id: string) => void;
  onNavigateTab: (tab: DashboardTab) => void;
  onOpenReportModal: () => void;
  onTriggerSpike: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  currentPoint,
  history,
  totalTrashKg,
  recentTrashGained,
  selectedSector,
  fleetRobots,
  selectedRobotId,
  onSelectRobot,
  onNavigateTab,
  onOpenReportModal,
  onTriggerSpike,
}) => {
  // Compute Water Quality Index (WQI) out of 100 based on pH, DO, Turbidity, and Temp
  const computeWQI = (pt: TelemetryPoint) => {
    let score = 100;
    // pH penalty (ideal 7.0 - 8.0)
    const phDev = Math.abs(pt.ph - 7.5);
    score -= phDev * 18;
    // DO penalty (ideal > 6.0 mg/L)
    if (pt.dissolvedOxygen < 6.0) score -= (6.0 - pt.dissolvedOxygen) * 8;
    // Turbidity penalty (ideal < 20 NTU)
    if (pt.turbidity > 20) score -= (pt.turbidity - 20) * 0.4;
    return Math.max(10, Math.min(100, Math.round(score)));
  };

  const currentWQI = computeWQI(currentPoint);
  const wqiStatus =
    currentWQI >= 85
      ? { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' }
      : currentWQI >= 70
      ? { label: 'Good (WBPCB Standard)', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' }
      : currentWQI >= 50
      ? { label: 'Moderate Concern', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' }
      : { label: 'Critical Hazard', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };

  const totalSolarWatts = fleetRobots.reduce((acc, r) => acc + (r.solarWatts || 160), 0);
  const totalFleetCapacity = fleetRobots.reduce((acc, r) => acc + (r.trashCapacityKg || 100), 0);
  const currentFleetTrashLoad = fleetRobots.reduce((acc, r) => acc + (r.trashCollectedKg || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Welcome & Lake Mission Summary Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-cyan-950/40 border border-slate-800/90 backdrop-blur-2xl shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Waves className="w-3 h-3 text-cyan-400" />
                Tapan Dighi Operations
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Tapan, Dakshin Dinajpur, WB
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Trash<span className="text-cyan-400">Trekker</span> Fleet Command
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Monitoring 5 autonomous bio-skimmers and aquatic sensors deployed across the historic Tapan Dighi basin. All telemetry and water quality metrics shown are authentic, real data captured on-site by these robots and synchronized via 915MHz LoRa mesh.
            </p>
          </div>

          {/* Quick Tab Switch Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigateTab('map')}
              className="px-4 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all active:scale-95"
            >
              <Compass className="w-4 h-4" />
              Open Live Tapan Dighi Map
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigateTab('telemetry')}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700/80 flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              Sensor Telemetry
            </button>
          </div>
        </div>

        {/* Decorative Background Mesh Glow */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </div>

      {/* 4 Primary High-Impact Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Debris Harvested */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-slate-950/80 to-slate-950/95 border border-emerald-500/30 backdrop-blur-xl shadow-xl shadow-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-emerald-400" />
              Debris Harvested
            </span>
            {recentTrashGained > 0 && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                +{recentTrashGained}kg Skimmed
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {totalTrashKg.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-emerald-400">kg collected</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-emerald-500/20">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (currentFleetTrashLoad / totalFleetCapacity) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Swarm Load: {currentFleetTrashLoad.toFixed(1)}kg</span>
            <span className="text-emerald-400 font-semibold">Cap: {totalFleetCapacity}kg</span>
          </div>
        </div>

        {/* Metric 2: Water Quality Index */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-950/30 via-slate-950/80 to-slate-950/95 border border-cyan-500/30 backdrop-blur-xl shadow-xl shadow-cyan-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Water Quality (WQI)
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${wqiStatus.bg} ${wqiStatus.color} ${wqiStatus.border}`}>
              {wqiStatus.label}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {currentWQI}
            </span>
            <span className="text-sm font-semibold text-cyan-300">/ 100 AQI</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-cyan-500/20">
            <div
              className="bg-gradient-to-r from-cyan-500 to-sky-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${currentWQI}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>pH: {currentPoint.ph.toFixed(2)}</span>
            <span className="text-cyan-400 font-semibold">DO: {currentPoint.dissolvedOxygen} mg/L</span>
          </div>
        </div>

        {/* Metric 3: Active Fleet Status */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-950/30 via-slate-950/80 to-slate-950/95 border border-violet-500/30 backdrop-blur-xl shadow-xl shadow-violet-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-violet-400" />
              Autonomous Fleet
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              5/5 Online
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              5
            </span>
            <span className="text-sm font-semibold text-violet-300">Active Vessels</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {fleetRobots.map((robot) => (
              <button
                key={robot.id}
                onClick={() => {
                  onSelectRobot(robot.id);
                  onNavigateTab('map');
                }}
                title={`${robot.callsign} (${robot.battery}% Batt)`}
                className="flex-1 h-6 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold transition-transform hover:scale-105"
                style={{
                  backgroundColor: `${robot.color}25`,
                  color: robot.color,
                  border: `1px solid ${robot.color}60`,
                }}
              >
                {robot.callsign.replace('TT-', '')}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Lake Patrol Swarm</span>
            <span className="text-violet-400 font-semibold cursor-pointer hover:underline" onClick={() => onNavigateTab('fleet')}>
              Manage Swarm →
            </span>
          </div>
        </div>

        {/* Metric 4: Solar Generation & Battery */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-950/80 to-slate-950/95 border border-amber-500/30 backdrop-blur-xl shadow-xl shadow-amber-950/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-medium text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              Solar Harvesting
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Zero Emissions
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {totalSolarWatts}
            </span>
            <span className="text-sm font-semibold text-amber-300">Watts In</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-amber-500/20">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalSolarWatts / 1000) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Primary Battery: {currentPoint.battery}%</span>
            <span className="text-amber-400 font-semibold">Self-Sustaining</span>
          </div>
        </div>

      </div>

      {/* Real-time Comprehensive Sensor Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Live Sensor Telemetry Array (WQMS-01)
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('telemetry')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            View Analytical Charts & Historical Stream →
          </button>
        </div>

        <SensorGrid currentPoint={currentPoint} />
      </div>

      {/* 5-Robot Swarm Quick Deployment Matrix */}
      <div className="rounded-3xl p-6 bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              Active Pond Swarm Formation
            </h3>
            <p className="text-xs text-slate-400">
              Live location, task assignments, and battery reserves for all 5 deployed vessels.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('fleet')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 text-xs font-semibold transition-all shrink-0"
          >
            Fleet Command Center →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fleetRobots.map((robot) => {
            const isSelected = robot.id === selectedRobotId;
            return (
              <div
                key={robot.id}
                onClick={() => {
                  onSelectRobot(robot.id);
                  onNavigateTab('map');
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: robot.color, boxShadow: `0 0 8px ${robot.color}` }}
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">{robot.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono">{robot.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                    {robot.callsign}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60 text-[11px] font-mono">
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-sans">Battery</span>
                    <span className="font-bold text-emerald-400">{robot.battery}%</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-sans">Collected</span>
                    <span className="font-bold text-amber-400">{robot.trashCollectedKg}kg</span>
                  </div>
                  <div>
                    <span className="text-[9.5px] text-slate-400 block font-sans">Speed</span>
                    <span className="font-bold text-sky-400">{robot.speedKnots} kts</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
