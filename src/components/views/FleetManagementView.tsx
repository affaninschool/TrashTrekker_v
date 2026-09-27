import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Anchor,
  ArrowRight,
  Battery,
  BatteryCharging,
  Bot,
  CheckCircle,
  Compass,
  Cpu,
  Droplets,
  Flame,
  Gauge,
  Layers,
  MapPin,
  Navigation,
  Power,
  Radio,
  RefreshCw,
  RotateCw,
  Send,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Thermometer,
  Trash2,
  Waves,
  Wind,
  Zap
} from 'lucide-react';
import { FleetRobot, RiverSector, TelemetryPoint } from '../../types';

interface FleetManagementViewProps {
  fleetRobots: FleetRobot[];
  selectedRobotId: string;
  onSelectRobot: (id: string) => void;
  selectedSector: RiverSector;
  currentPoint: TelemetryPoint;
  onOpenDevicePairing: () => void;
}

export const FleetManagementView: React.FC<FleetManagementViewProps> = ({
  fleetRobots,
  selectedRobotId,
  onSelectRobot,
  selectedSector,
  currentPoint,
  onOpenDevicePairing,
}) => {
  const [swarmFormation, setSwarmFormation] = useState<'PERIMETER' | 'CONVERGENCE' | 'PLUME_SAMPLING' | 'DOCK_RETURN'>('PERIMETER');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const totalTrash = fleetRobots.reduce((acc, r) => acc + (r.trashCollectedKg || 0), 0);
  const totalCapacity = fleetRobots.reduce((acc, r) => acc + (r.trashCapacityKg || 100), 0);
  const totalSolar = fleetRobots.reduce((acc, r) => acc + (r.solarWatts || 150), 0);
  const avgBattery = Math.round(fleetRobots.reduce((acc, r) => acc + r.battery, 0) / (fleetRobots.length || 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Bot className="w-3 h-3 text-cyan-400" />
              Autonomous Swarm Operations
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              ● 5/5 Swarm Units Nominal
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Fleet Management & Swarm Formation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time multi-agent autonomous control, waypoint trajectory dispatch, and battery health telemetry for the Tapan Dighi swarm.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenDevicePairing}
            className="px-3.5 py-2 rounded-2xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold border border-cyan-500/40 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Hardware Link & ROS2
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-mono flex items-center justify-between shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Swarm Radio Broadcast: <strong>{toastMessage}</strong></span>
          </div>
          <span className="text-[10px] text-cyan-400">ACKNOWLEDGED</span>
        </div>
      )}

      {/* Aggregate Swarm Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
            Fleet Average Battery
          </span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">
            {avgBattery}%
          </span>
          <span className="text-[10px] text-slate-400 font-mono">5 Active Lithium Packs</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
            Combined Solar Input
          </span>
          <span className="text-2xl font-bold font-mono text-yellow-400 mt-1 block">
            {totalSolar} <span className="text-xs text-slate-400 font-sans">Watts</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Monocrystalline Grid</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
            Total Swarm Harvest
          </span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">
            {totalTrash.toFixed(1)} <span className="text-xs text-slate-400 font-sans">/ {totalCapacity} kg</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {((totalTrash / totalCapacity) * 100).toFixed(0)}% Total Capacity
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl">
          <span className="text-[10px] font-sans text-slate-400 uppercase tracking-wider block">
            LoRa Mesh RSSI
          </span>
          <span className="text-2xl font-bold font-mono text-sky-400 mt-1 block">
            -76 <span className="text-xs text-slate-400 font-sans">dBm</span>
          </span>
          <span className="text-[10px] text-emerald-400 font-mono font-semibold">100% Packet Delivery</span>
        </div>
      </div>

      {/* Swarm Formation Mode Selector */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-950/80 border border-slate-800/90 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              Autonomous Swarm Strategy & Patrol Mode
            </h3>
            <p className="text-xs text-slate-400">
              Select the coordinated swarm algorithm executed by all 5 autonomous vessels.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'PERIMETER',
              title: 'Dispersed Perimeter Sweep',
              desc: 'Full closed-pond coverage patrolling all shorelines and reed banks.',
              color: 'border-cyan-500 text-cyan-300',
            },
            {
              id: 'CONVERGENCE',
              title: 'Bio-Skimmer Convergence',
              desc: 'Focus TT-01 and TT-02 on high-density debris accumulating at the East Bio-Weir.',
              color: 'border-emerald-500 text-emerald-300',
            },
            {
              id: 'PLUME_SAMPLING',
              title: 'Deep Limnology Profiling',
              desc: 'Perform synchronized vertical and horizontal water sampling rounds.',
              color: 'border-purple-500 text-purple-300',
            },
            {
              id: 'DOCK_RETURN',
              title: 'Return All to Solar Dock',
              desc: 'RTH protocol: Navigate all vessels to North Solar Jetty for battery recharge.',
              color: 'border-amber-500 text-amber-300',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => {
                setSwarmFormation(mode.id as any);
                triggerToast(`Swarm mode updated: ${mode.title}`);
              }}
              className={`p-4 rounded-2xl text-left transition-all duration-200 border ${
                swarmFormation === mode.id
                  ? 'bg-cyan-500/15 border-cyan-500 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/50 hover:bg-slate-900/80 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-white">{mode.title}</span>
                {swarmFormation === mode.id && (
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 5 Individual Robot Vessel Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bot className="w-4 h-4 text-cyan-400" />
          Active Fleet Units (5 Vessels)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fleetRobots.map((robot) => {
            const isSelected = robot.id === selectedRobotId;
            return (
              <div
                key={robot.id}
                className={`p-5 rounded-3xl transition-all duration-200 border backdrop-blur-xl space-y-4 ${
                  isSelected
                    ? 'bg-slate-950/95 border-cyan-500 shadow-2xl shadow-cyan-950/50 ring-1 ring-cyan-500/50'
                    : 'bg-slate-950/70 hover:bg-slate-950/90 border-slate-800/80'
                }`}
              >
                {/* Robot Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-lg"
                      style={{
                        backgroundColor: `${robot.color}25`,
                        color: robot.color,
                        border: `1px solid ${robot.color}60`,
                      }}
                    >
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate">{robot.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Callsign: <strong className="text-slate-200">{robot.callsign}</strong>
                      </span>
                    </div>
                  </div>

                  <span
                    className="text-[9.5px] font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{
                      backgroundColor: `${robot.color}15`,
                      color: robot.color,
                      borderColor: `${robot.color}40`,
                    }}
                  >
                    {robot.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Location */}
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono flex items-center gap-2 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="truncate">{robot.locationName}</span>
                </div>

                {/* Telemetry Matrix */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Battery</span>
                    <span className="font-bold text-emerald-400">{robot.battery}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Harvest Load</span>
                    <span className="font-bold text-amber-400">{robot.trashCollectedKg} / {robot.trashCapacityKg} kg</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Speed</span>
                    <span className="font-bold text-sky-400">{robot.speedKnots} kts</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Solar Power</span>
                    <span className="font-bold text-yellow-400">{robot.solarWatts} W</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      onSelectRobot(robot.id);
                      triggerToast(`Selected ${robot.callsign} for direct tele-operation.`);
                    }}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-bold border border-cyan-500/30 transition-all text-center"
                  >
                    Select Unit
                  </button>
                  <button
                    onClick={() => triggerToast(`Command sent: ${robot.callsign} RTH (Return to Home Dock)`)}
                    className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all flex items-center gap-1"
                  >
                    <Anchor className="w-3 h-3 text-amber-400" />
                    RTH
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
