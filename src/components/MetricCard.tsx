import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  id?: string;
  title: string;
  value: string | number;
  unit?: string;
  secondaryValue?: string;
  icon: LucideIcon;
  status: 'safe' | 'warning' | 'critical';
  statusText: string;
  thresholdText: string;
  minRange: number;
  maxRange: number;
  currentNumber: number;
  safeMin: number;
  safeMax: number;
  subDetails?: { label: string; value: string }[];
  isCriticalAlert?: boolean;
  colorTheme?: 'cyan' | 'amber' | 'sky' | 'emerald' | 'violet' | 'purple' | 'orange' | 'lime' | 'teal' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  unit,
  secondaryValue,
  icon: Icon,
  status,
  statusText,
  thresholdText,
  minRange,
  maxRange,
  currentNumber,
  safeMin,
  safeMax,
  subDetails,
  isCriticalAlert,
  colorTheme = 'cyan',
}) => {
  // Palette themes when in 'safe' status
  const themeStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      bg: 'bg-gradient-to-br from-cyan-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-cyan-300',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      bar: 'bg-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      glow: 'shadow-cyan-950/30',
      strip: 'from-cyan-400 to-blue-500',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      bg: 'bg-gradient-to-br from-amber-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-amber-300',
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      bar: 'bg-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      glow: 'shadow-amber-950/30',
      strip: 'from-amber-400 to-yellow-500',
    },
    sky: {
      border: 'border-sky-500/30 hover:border-sky-400/60',
      bg: 'bg-gradient-to-br from-sky-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-sky-300',
      badge: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
      bar: 'bg-sky-400',
      iconBg: 'bg-sky-500/20 text-sky-300 border-sky-400/30',
      glow: 'shadow-sky-950/30',
      strip: 'from-sky-400 to-indigo-500',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      bg: 'bg-gradient-to-br from-emerald-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      bar: 'bg-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      glow: 'shadow-emerald-950/30',
      strip: 'from-emerald-400 to-teal-500',
    },
    violet: {
      border: 'border-violet-500/30 hover:border-violet-400/60',
      bg: 'bg-gradient-to-br from-violet-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-violet-300',
      badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      bar: 'bg-violet-400',
      iconBg: 'bg-violet-500/20 text-violet-300 border-violet-400/30',
      glow: 'shadow-violet-950/30',
      strip: 'from-violet-400 to-purple-500',
    },
    purple: {
      border: 'border-purple-500/30 hover:border-purple-400/60',
      bg: 'bg-gradient-to-br from-purple-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-purple-300',
      badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
      bar: 'bg-purple-400',
      iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
      glow: 'shadow-purple-950/30',
      strip: 'from-purple-400 to-pink-500',
    },
    orange: {
      border: 'border-orange-500/30 hover:border-orange-400/60',
      bg: 'bg-gradient-to-br from-orange-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-orange-300',
      badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
      bar: 'bg-orange-400',
      iconBg: 'bg-orange-500/20 text-orange-300 border-orange-400/30',
      glow: 'shadow-orange-950/30',
      strip: 'from-orange-400 to-amber-500',
    },
    lime: {
      border: 'border-lime-500/30 hover:border-lime-400/60',
      bg: 'bg-gradient-to-br from-lime-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-lime-300',
      badge: 'bg-lime-500/15 text-lime-300 border-lime-500/30',
      bar: 'bg-lime-400',
      iconBg: 'bg-lime-500/20 text-lime-300 border-lime-400/30',
      glow: 'shadow-lime-950/30',
      strip: 'from-lime-400 to-emerald-500',
    },
    teal: {
      border: 'border-teal-500/30 hover:border-teal-400/60',
      bg: 'bg-gradient-to-br from-teal-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-teal-300',
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      bar: 'bg-teal-400',
      iconBg: 'bg-teal-500/20 text-teal-300 border-teal-400/30',
      glow: 'shadow-teal-950/30',
      strip: 'from-teal-400 to-cyan-500',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400/60',
      bg: 'bg-gradient-to-br from-rose-950/25 via-slate-900/60 to-slate-950/80',
      text: 'text-rose-300',
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      bar: 'bg-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      glow: 'shadow-rose-950/30',
      strip: 'from-rose-400 to-red-500',
    },
  };

  const safePalette = themeStyles[colorTheme] || themeStyles.cyan;

  // Status overrides if warning or critical
  const colorStyles = status === 'critical'
    ? {
        border: 'border-rose-500/50 hover:border-rose-500/80',
        bg: 'bg-gradient-to-br from-rose-950/40 via-slate-900/70 to-slate-950/90',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold',
        bar: 'bg-rose-500',
        iconBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        glow: 'shadow-rose-950/40',
        strip: 'from-rose-500 to-red-600',
      }
    : status === 'warning'
    ? {
        border: 'border-amber-500/40 hover:border-amber-500/70',
        bg: 'bg-gradient-to-br from-amber-950/40 via-slate-900/70 to-slate-950/90',
        text: 'text-amber-300',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold',
        bar: 'bg-amber-400',
        iconBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        glow: 'shadow-amber-950/40',
        strip: 'from-amber-400 to-yellow-500',
      }
    : safePalette;

  // Calculate percentage along min/max for scale bar
  const totalRange = maxRange - minRange;
  const clampedVal = Math.max(minRange, Math.min(maxRange, currentNumber));
  const pointerPercent = ((clampedVal - minRange) / totalRange) * 100;

  const safeStartPercent = ((safeMin - minRange) / totalRange) * 100;
  const safeWidthPercent = ((safeMax - safeMin) / totalRange) * 100;

  return (
    <div
      id={id}
      className={`relative rounded-xl ${colorStyles.bg} border ${colorStyles.border} p-4 backdrop-blur-md shadow-md ${colorStyles.glow} transition-all duration-200 flex flex-col justify-between overflow-hidden group`}
    >
      {/* Critical flashing aura background */}
      {isCriticalAlert && (
        <div className="absolute inset-0 bg-rose-600/5 animate-pulse pointer-events-none rounded-xl" />
      )}

      {/* Top row: Title, Icon & Status Pill */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg border ${colorStyles.iconBg}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {title}
            </h3>
          </div>
        </div>

        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider border ${colorStyles.badge}`}
        >
          {statusText}
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="my-2.5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl sm:text-3xl font-mono font-bold tracking-tight ${colorStyles.text}`}>
            {value}
          </span>
          {unit && (
            <span className="text-xs font-semibold text-slate-400 font-sans">
              {unit}
            </span>
          )}
        </div>
        {secondaryValue && (
          <div className="text-right">
            <span className="text-[11px] font-mono font-medium text-slate-400">
              {secondaryValue}
            </span>
          </div>
        )}
      </div>

      {/* Visual Threshold Bar */}
      <div className="space-y-1 pt-1">
        <div className="relative h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50">
          {/* Safe zone highlight */}
          <div
            className="absolute top-0 bottom-0 bg-emerald-500/20 border-x border-emerald-500/40"
            style={{
              left: `${safeStartPercent}%`,
              width: `${safeWidthPercent}%`,
            }}
            title={`Safe Range: ${safeMin} - ${safeMax}`}
          />
          {/* Current fill indicator */}
          <div
            className={`h-full ${colorStyles.bar} transition-all duration-500 rounded-full`}
            style={{ width: `${pointerPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
          <span>{minRange}</span>
          <span className="text-slate-400 font-medium">
            {thresholdText}
          </span>
          <span>{maxRange}</span>
        </div>
      </div>

      {/* Optional sub-details */}
      {subDetails && subDetails.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
          {subDetails.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">{item.label}</span>
              <span className="font-mono text-slate-300 font-medium text-[11px]">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
