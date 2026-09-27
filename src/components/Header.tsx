import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Compass,
  Download,
  FileDown,
  FileText,
  Gauge,
  Key,
  LogIn,
  LogOut,
  MapPin,
  Pause,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  Sparkles,
  Trash2,
  UserCheck,
  Waves,
  Zap
} from 'lucide-react';
import { RiverSector, TelemetryPoint, UserProfile } from '../types';
import { RIVER_SECTORS } from '../utils/simulation';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface HeaderProps {
  currentPoint: TelemetryPoint;
  totalTrashKg: number;
  recentTrashGained: number;
  isRunning: boolean;
  onTogglePlay: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  onTriggerSpike: () => void;
  onResetMission: () => void;
  selectedSector: RiverSector;
  onSelectSector: (sector: RiverSector) => void;
  uptimeSeconds: number;
  criticalAlertsCount: number;
  onExportData: () => void;
  onExportPDF: () => void;
  onOpenDevicePairing?: () => void;
  isLiveHardwareMode?: boolean;
  activeRobotsCount?: number;
  user: UserProfile | null;
  onLogin: () => void;
  signingIn?: boolean;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPoint,
  totalTrashKg,
  recentTrashGained,
  isRunning,
  onTogglePlay,
  speed,
  onChangeSpeed,
  onTriggerSpike,
  onResetMission,
  selectedSector,
  onSelectSector,
  uptimeSeconds,
  criticalAlertsCount,
  onExportData,
  onExportPDF,
  onOpenDevicePairing,
  isLiveHardwareMode,
  activeRobotsCount = 5,
  user,
  onLogin,
  signingIn = false,
  onLogout,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);

  const handleDownloadPDF = async () => {
    setIsExportingPDF(true);
    try {
      await onExportPDF();
    } finally {
      setTimeout(() => setIsExportingPDF(false), 800);
    }
  };
  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-slate-950/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 py-4 shadow-xl shadow-black/30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Brand & Bot Status */}
        <div className="flex flex-wrap items-center gap-3.5">
          <div className="flex items-center gap-3">
            <TrashTrekkerLogo size="md" />

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  <span className="text-cyan-400 font-extrabold">Trash-Trekker</span>
                  <span className="text-cyan-300 font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30">
                    MK-IV
                  </span>
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-300 tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  {activeRobotsCount} ROBOTS ACTIVE
                </span>
                {isLiveHardwareMode && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-emerald-300" />
                    LIVE HARDWARE API
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRunning ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isRunning ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  {isRunning ? `Autonomous Fleet: ${selectedSector.name}` : 'Mission Paused'}
                </span>
                <span className="text-slate-700">•</span>
                <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                  <Activity className="w-3 h-3 text-slate-600" />
                  {formatUptime(uptimeSeconds)}
                </span>
              </div>
            </div>
          </div>

          {/* Sector Selector */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <select
              value={selectedSector.id}
              onChange={(e) => {
                const sector = RIVER_SECTORS.find((s) => s.id === e.target.value);
                if (sector) onSelectSector(sector);
              }}
              className="bg-transparent text-slate-300 text-xs font-medium focus:outline-none cursor-pointer pr-2"
            >
              {RIVER_SECTORS.map((sec) => (
                <option key={sec.id} value={sec.id} className="bg-slate-900 text-slate-200">
                  {sec.river} ({sec.country})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Section: Robot API Link, Gemini Copilot, Auth & Mission Controls */}
        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
          
          {/* Header Stats */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider flex items-center justify-end gap-1">
                Trash Cleared
                {recentTrashGained > 0 && (
                  <span className="animate-bounce inline-flex items-center px-1 py-0.2 rounded text-[9px] font-bold bg-emerald-500 text-slate-950 font-mono">
                    +{recentTrashGained}kg
                  </span>
                )}
              </p>
              <p className="text-xl sm:text-2xl font-mono text-emerald-400 font-bold">
                {totalTrashKg.toFixed(2)} <span className="text-xs sm:text-sm font-semibold text-emerald-500 font-sans">kg</span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                Battery
              </p>
              <p className="text-xl sm:text-2xl font-mono text-sky-400 font-bold">
                {currentPoint.battery}<span className="text-xs sm:text-sm font-semibold text-sky-500 font-sans">%</span>
              </p>
            </div>
          </div>

          {/* Robot Hardware & Secret Key API Launcher */}
          {onOpenDevicePairing && (
            <button
              onClick={onOpenDevicePairing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all shadow-md group ${
                isLiveHardwareMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-500/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-500/40'
              }`}
              title="Connect Robot with API & Manage Secret Codes / Paired Devices"
            >
              <Key className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-45 transition-transform" />
              <span className="font-semibold">Connect Robot</span>
              <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 text-slate-300 rounded font-mono border border-slate-700">
                API
              </span>
            </button>
          )}

          {/* Firebase Google Auth Button */}
          {user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Operator'}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-500/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-[10px]">
                  {(user.displayName || 'O')[0]}
                </div>
              )}
              <span className="hidden md:inline text-slate-300 font-medium truncate max-w-[100px]">
                {user.displayName?.split(' ')[0] || 'Operator'}
              </span>
              <button
                onClick={onLogout}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Sign out of Firebase"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={signingIn}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all ${
                signingIn ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Sign in with Google to sync alerts & persist mission state in Firebase Firestore"
            >
              {signingIn ? (
                <RotateCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              )}
              <span className="hidden sm:inline">{signingIn ? 'Signing In...' : 'Sign In'}</span>
            </button>
          )}

          {/* Simulation Controls */}
          <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1">
            <button
              onClick={onTogglePlay}
              title={isRunning ? 'Pause mission stream' : 'Resume mission stream'}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                isRunning
                  ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span className="hidden sm:inline">{isRunning ? 'Pause' : 'Resume'}</span>
            </button>

            {/* Speed Toggle */}
            <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800/80 text-[11px] font-mono">
              {[1, 2, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => onChangeSpeed(s)}
                  className={`px-1.5 sm:px-2 py-1 rounded transition-colors ${
                    speed === s
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Trigger pH Spike Button */}
            <button
              onClick={onTriggerSpike}
              title="Inject simulated illegal chemical discharge to test emergency alerts"
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition-all uppercase tracking-wider group"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Spike</span>
            </button>

            {/* Reset Mission */}
            <button
              onClick={onResetMission}
              title="Reset telemetry & position to river origin"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};

