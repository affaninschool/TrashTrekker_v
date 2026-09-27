import React from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  FileDown,
  Gauge,
  Key,
  Layers,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Moon,
  Radio,
  RotateCw,
  Settings,
  Shield,
  Sliders,
  Sparkles,
  Sun,
  Trash2,
  Waves,
  Zap
} from 'lucide-react';
import { ColorTheme, DashboardTab, RiverSector, TelemetryPoint, ThemeMode, UserProfile } from '../types';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface SidebarProps {
  currentTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  totalTrashKg: number;
  recentTrashGained: number;
  currentPoint: TelemetryPoint;
  activeRobotsCount: number;
  isLiveHardwareMode: boolean;
  pendingAlertsCount: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
  colorTheme?: ColorTheme;
  user: UserProfile | null;
  onLogin: () => void;
  signingIn?: boolean;
  onLogout: () => void;
  onOpenDevicePairing: () => void;
  onOpenConfigModal: () => void;
  onOpenReportModal: () => void;
  onTriggerSpike: () => void;
  selectedSector: RiverSector;
  uptimeSeconds: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  totalTrashKg,
  recentTrashGained,
  currentPoint,
  activeRobotsCount = 5,
  isLiveHardwareMode,
  pendingAlertsCount,
  theme,
  onToggleTheme,
  colorTheme,
  user,
  onLogin,
  signingIn = false,
  onLogout,
  onOpenDevicePairing,
  onOpenConfigModal,
  onOpenReportModal,
  onTriggerSpike,
  selectedSector,
  uptimeSeconds,
}) => {
  const isLight = theme === 'light';

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const navItems: {
    id: DashboardTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    badgeColor?: string;
    activeBg: string;
    activeBorder: string;
    activeIconBg: string;
    stripGrad: string;
    hoverText: string;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      description: 'System health & live KPIs',
      icon: LayoutDashboard,
      badge: 'Real-Time',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      activeBg: 'bg-gradient-to-r from-sky-600/25 via-cyan-600/20 to-blue-950/30',
      activeBorder: 'border-sky-500/50 shadow-sky-950/50',
      activeIconBg: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
      stripGrad: 'from-sky-400 to-blue-500',
      hoverText: 'group-hover:text-sky-300',
    },
    {
      id: 'map',
      label: 'Live Map',
      description: '5-Robot lake sweep tracking',
      icon: Map,
      badge: `${activeRobotsCount} Active`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      activeBg: 'bg-gradient-to-r from-emerald-600/25 via-teal-600/20 to-emerald-950/30',
      activeBorder: 'border-emerald-500/50 shadow-emerald-950/50',
      activeIconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
      stripGrad: 'from-emerald-400 to-teal-400',
      hoverText: 'group-hover:text-emerald-300',
    },
    {
      id: 'telemetry',
      label: 'Sensor Telemetry',
      description: 'pH, DO, Temp & Gas curves',
      icon: Activity,
      badge: pendingAlertsCount > 0 ? `${pendingAlertsCount} Alert` : '8 Probes',
      badgeColor: pendingAlertsCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      activeBg: 'bg-gradient-to-r from-purple-600/25 via-violet-600/20 to-fuchsia-950/30',
      activeBorder: 'border-purple-500/50 shadow-purple-950/50',
      activeIconBg: 'bg-gradient-to-br from-purple-500 to-violet-600 text-white shadow-purple-500/30',
      stripGrad: 'from-purple-400 to-fuchsia-400',
      hoverText: 'group-hover:text-purple-300',
    },
    {
      id: 'fleet',
      label: 'Fleet Management',
      description: 'Autonomous swarm dispatch',
      icon: Bot,
      badge: '5 Bots',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      activeBg: 'bg-gradient-to-r from-amber-600/25 via-orange-600/20 to-yellow-950/30',
      activeBorder: 'border-amber-500/50 shadow-amber-950/50',
      activeIconBg: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
      stripGrad: 'from-yellow-400 to-orange-500',
      hoverText: 'group-hover:text-amber-300',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col justify-between transition-all duration-300 z-40 border-r ${
        isLight
          ? 'bg-white/90 border-slate-200 text-slate-900 shadow-xl shadow-slate-200/50'
          : 'bg-slate-950/90 border-slate-800/90 text-slate-100 backdrop-blur-2xl shadow-2xl shadow-black/60'
      } ${collapsed ? 'w-20' : 'w-64 lg:w-72'} shrink-0`}
    >
      {/* Top Header / App Branding */}
      <div className="p-4 sm:p-5 border-b border-slate-800/60">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onSelectTab('overview')}>
            <div className="relative shrink-0">
              <TrashTrekkerLogo size={collapsed ? 'sm' : 'md'} />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-400 ring-2 ring-slate-950"></span>
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-sans truncate">
                    Trash<span className="text-violet-400">Trekker</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-yellow-400/20 text-yellow-300 border border-yellow-400/40">
                    MK-IV
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-mono tracking-tight truncate">
                  Autonomous Eco-Swarm
                </p>
              </div>
            )}
          </div>

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Live Swarm Status Pill */}
        {!collapsed && (
          <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-medium text-slate-300 truncate">
                {selectedSector.name.split(' (')[0]}
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
              5 ONLINE
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
        <div className="px-2 pb-1.5">
          {!collapsed && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Mission Controls
            </span>
          )}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? `${item.label} - ${item.description}` : undefined}
              className={`w-full group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                isActive
                  ? `${item.activeBg} text-white font-semibold border ${item.activeBorder} shadow-lg`
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              } ${collapsed ? 'justify-center px-0 py-3' : ''}`}
            >
              {/* Active Neon Accent Strip on Left */}
              {isActive && (
                <span className={`absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full bg-gradient-to-b ${item.stripGrad} shadow-[0_0_12px_rgba(255,255,255,0.8)]`} />
              )}

              <div
                className={`p-2 rounded-lg transition-colors shrink-0 ${
                  isActive
                    ? `${item.activeIconBg} font-bold border border-white/20`
                    : `bg-slate-900/80 text-slate-400 ${item.hoverText} group-hover:bg-slate-800`
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-semibold tracking-wide truncate">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {item.description}
                  </p>
                </div>
              )}
            </button>
          );
        })}

        {/* Quick Operations Section */}
        <div className="pt-4 px-2 pb-1.5">
          {!collapsed && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              Autonomous Operations
            </span>
          )}
        </div>

        {/* Hardware API Connect */}
        <button
          onClick={onOpenDevicePairing}
          title={collapsed ? 'Connect Robot Hardware / API' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all border border-transparent ${
            collapsed ? 'justify-center px-0 py-2.5' : ''
          }`}
        >
          <div className="p-1.5 rounded-lg bg-slate-900 text-amber-400 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="block truncate font-medium text-slate-300">Robot API & IoT Link</span>
              <span className="text-[10px] text-slate-400">ESP32 & ROS2 Gateway</span>
            </div>
          )}
        </button>

        {/* Alert Thresholds Modal Trigger */}
        <button
          onClick={onOpenConfigModal}
          title={collapsed ? 'Threshold Rules & Opt-Ins' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all border border-transparent ${
            collapsed ? 'justify-center px-0 py-2.5' : ''
          }`}
        >
          <div className="p-1.5 rounded-lg bg-slate-900 text-emerald-400 shrink-0">
            <Sliders className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="block truncate font-medium text-slate-300">Alert Rules & Opt-Ins</span>
              <span className="text-[10px] text-slate-400">pH, DO, Turbidity Limits</span>
            </div>
          )}
        </button>

        {/* Analytical PDF Report Modal Trigger */}
        <button
          onClick={onOpenReportModal}
          title={collapsed ? 'Analytical Reports & PDF' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-all border border-transparent ${
            collapsed ? 'justify-center px-0 py-2.5' : ''
          }`}
        >
          <div className="p-1.5 rounded-lg bg-slate-900 text-cyan-400 shrink-0">
            <BarChart3 className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="block truncate font-medium text-slate-300">Monthly Report & PDF</span>
              <span className="text-[10px] text-slate-400">WBPCB Compliance Logs</span>
            </div>
          )}
        </button>

        {/* Test Spike Simulation Button */}
        <button
          onClick={onTriggerSpike}
          title={collapsed ? 'Simulate Emergency Hazard Spike' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-medium text-rose-300/80 hover:text-rose-200 hover:bg-rose-500/10 transition-all border border-rose-500/20 ${
            collapsed ? 'justify-center px-0 py-2.5' : ''
          }`}
        >
          <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <span className="block truncate font-bold text-rose-300">Simulate Hazard Spike</span>
              <span className="text-[10px] text-rose-400/80">Trigger Acid/Sediment Alarm</span>
            </div>
          )}
        </button>
      </div>

      {/* Bottom Summary Card & User Profile */}
      <div className="p-3 sm:p-4 border-t border-slate-800/60 space-y-3">
        {/* Quick Trash & Battery Glance Card (When not collapsed) */}
        {!collapsed && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800/90 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Trash2 className="w-3 h-3 text-emerald-400" />
                Harvest Total
              </span>
              {recentTrashGained > 0 && (
                <span className="animate-bounce text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950">
                  +{recentTrashGained}kg
                </span>
              )}
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-400 tracking-tight">
                {totalTrashKg.toFixed(1)} <span className="text-xs text-emerald-500 font-sans">kg</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] font-mono text-sky-400">
                <Zap className="w-3 h-3 fill-sky-400" />
                <span>{currentPoint.battery}%</span>
              </div>
            </div>

            {/* Uptime & Connection Protocol */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Uptime: {formatUptime(uptimeSeconds)}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                <Radio className="w-2.5 h-2.5" /> 915MHz
              </span>
            </div>
          </div>
        )}

        {/* User Profile & Theme Toggle */}
        <div className="flex items-center justify-between gap-2 pt-1">
          {user ? (
            <div className="flex items-center gap-2 min-w-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover border border-cyan-500/50 shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                  {(user.displayName || 'O')[0]}
                </div>
              )}
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-slate-200 truncate">
                    {user.displayName?.split(' ')[0] || 'Operator'}
                  </span>
                  <button
                    onClick={onLogout}
                    className="text-[10px] text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onLogin}
              disabled={signingIn}
              title="Sign In with Google"
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 transition-all ${
                signingIn ? 'opacity-60 cursor-not-allowed' : ''
              } ${
                collapsed ? 'justify-center p-2 w-full' : ''
              }`}
            >
              {signingIn ? (
                <RotateCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              )}
              {!collapsed && <span>{signingIn ? 'Signing in...' : 'Sign In'}</span>}
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle light or dark theme"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-amber-400 border border-slate-800 transition-colors shrink-0"
          >
            {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </aside>
  );
};
