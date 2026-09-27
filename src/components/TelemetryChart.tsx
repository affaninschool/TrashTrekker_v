import React, { useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Biohazard,
  Flame,
  FlaskConical,
  Info,
  Leaf,
  Maximize2,
  TrendingDown,
  TrendingUp,
  Waves
} from 'lucide-react';
import { TelemetryPoint } from '../types';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface TelemetryChartProps {
  history: TelemetryPoint[];
  pointLimit?: number;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  history,
  pointLimit = 20,
}) => {
  const [activeTab, setActiveTab] = useState<'ph-temp' | 'biochemical' | 'gas-toxicity' | 'turbidity-do' | 'trash'>('ph-temp');
  const [sampleCount, setSampleCount] = useState<number>(20);

  // Take the last N readings
  const chartData = history.slice(-sampleCount);

  // Calculate summary stats
  const phValues = chartData.map((d) => d.ph);
  const minPh = Math.min(...phValues);
  const maxPh = Math.max(...phValues);
  const avgPh = phValues.reduce((a, b) => a + b, 0) / (phValues.length || 1);

  const tempValues = chartData.map((d) => d.temperature);
  const avgTemp = tempValues.reduce((a, b) => a + b, 0) / (tempValues.length || 1);

  const bodValues = chartData.map((d) => d.bodLevel ?? 2.4);
  const avgBod = bodValues.reduce((a, b) => a + b, 0) / (bodValues.length || 1);

  const h2sValues = chartData.map((d) => d.h2sLevel ?? 0.008);
  const maxH2s = Math.max(...h2sValues);

  const methaneValues = chartData.map((d) => d.methaneLevel ?? 0.45);
  const maxMethane = Math.max(...methaneValues);

  const phosphateValues = chartData.map((d) => d.phosphateLevel ?? 0.09);
  const avgPhosphate = phosphateValues.reduce((a, b) => a + b, 0) / (phosphateValues.length || 1);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: TelemetryPoint = payload[0].payload;
      const isCritical = data.ph < 6.0 || (data.bodLevel && data.bodLevel >= 8.0) || (data.h2sLevel && data.h2sLevel >= 0.08) || (data.methaneLevel && data.methaneLevel >= 3.0);

      return (
        <div className="bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-xl p-3 shadow-2xl text-xs space-y-2 min-w-[210px]">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 font-mono">
            <span className="text-slate-400 font-semibold">{data.timestamp}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                isCritical
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              {isCritical ? 'ALERT SPIKE' : 'STABLE'}
            </span>
          </div>

          <div className="space-y-1 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">pH Level:</span>
              <span className={`font-bold ${data.ph < 6.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {data.ph.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Temperature:</span>
              <span className="font-semibold text-amber-300">{data.temperature}°C</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">BOD (Organic):</span>
              <span className={`font-semibold ${(data.bodLevel ?? 2.4) >= 8.0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                {(data.bodLevel ?? 2.4).toFixed(2)} mg/L
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">H₂S Toxicity:</span>
              <span className={`font-semibold ${(data.h2sLevel ?? 0.008) >= 0.08 ? 'text-rose-400' : 'text-yellow-300'}`}>
                {(data.h2sLevel ?? 0.008).toFixed(3)} ppm
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Methane (CH₄):</span>
              <span className={`font-semibold ${(data.methaneLevel ?? 0.45) >= 3.0 ? 'text-rose-400' : 'text-orange-300'}`}>
                {(data.methaneLevel ?? 0.45).toFixed(2)}% LEL
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Phosphate:</span>
              <span className="font-semibold text-teal-300">
                {(data.phosphateLevel ?? 0.09).toFixed(2)} mg/L
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Turbidity:</span>
              <span className="text-cyan-300">{data.turbidity} NTU</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-sans">Total Trash:</span>
              <span className="text-emerald-300 font-bold">{data.trashCollectedKg} kg</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 border-t border-slate-800/80 pt-1 font-mono">
            GPS: {data.lat.toFixed(4)}, {data.lng.toFixed(4)}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      
      {/* Top Chart Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrashTrekkerLogo size="xs" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Hydrochemical & Multi-Gas Telemetry Stream ({sampleCount} pts)
            </h2>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Real-time multi-spectral sensor monitoring: BOD, H₂S, Methane, Phosphate, pH & DO
          </p>
        </div>

        {/* View Switchers & Sample Window */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-between">
          <div className="flex flex-wrap items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('ph-temp')}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'ph-temp'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              pH & Temp
            </button>
            <button
              onClick={() => setActiveTab('biochemical')}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'biochemical'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BOD & Phosphate
            </button>
            <button
              onClick={() => setActiveTab('gas-toxicity')}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'gas-toxicity'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              H₂S & Methane
            </button>
            <button
              onClick={() => setActiveTab('turbidity-do')}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'turbidity-do'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Turbidity / O₂
            </button>
            <button
              onClick={() => setActiveTab('trash')}
              className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                activeTab === 'trash'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Trash
            </button>
          </div>

          <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800 text-[11px] font-mono">
            {[20, 35].map((n) => (
              <button
                key={n}
                onClick={() => setSampleCount(n)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  sampleCount === n
                    ? 'bg-slate-800 text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {n} pts
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart Graphic */}
      <div className="w-full h-[280px] sm:h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'ph-temp' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="phGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickLine={false}
              />

              {/* Left Y Axis for pH */}
              <YAxis
                yAxisId="left"
                domain={[4.5, 9.5]}
                stroke="#10b981"
                tick={{ fill: '#10b981', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'pH', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10, offset: 25 }}
              />

              {/* Right Y Axis for Temp */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[15, 32]}
                stroke="#f59e0b"
                tick={{ fill: '#f59e0b', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10, offset: 20 }}
              />

              {/* Safe pH Reference Lines and Critical Threshold line */}
              <ReferenceLine
                yAxisId="left"
                y={8.5}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                label={{ value: 'Safe pH Max (8.5)', fill: '#10b981', fontSize: 9, position: 'insideTopLeft' }}
              />
              <ReferenceLine
                yAxisId="left"
                y={6.5}
                stroke="#10b981"
                strokeDasharray="3 3"
                strokeOpacity={0.6}
                label={{ value: 'Safe pH Min (6.5)', fill: '#10b981', fontSize: 9, position: 'insideBottomLeft' }}
              />
              <ReferenceLine
                yAxisId="left"
                y={6.0}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Critical Acidic Limit (pH < 6.0)', fill: '#f43f5e', fontSize: 9, position: 'insideBottomRight' }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
              />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="ph"
                name="Water pH"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#phGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.ph < 6.0) {
                    return (
                      <circle
                        key={`dot-${payload.id}`}
                        cx={cx}
                        cy={cy}
                        r={5}
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth={2}
                        className="animate-pulse"
                      />
                    );
                  }
                  return (
                    <circle
                      key={`dot-${payload.id}`}
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#10b981"
                      stroke="#0f172a"
                      strokeWidth={1}
                    />
                  );
                }}
                activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2, fill: '#f59e0b' }}
                activeDot={{ r: 5, fill: '#fbbf24', stroke: '#ffffff' }}
              />
            </ComposedChart>
          ) : activeTab === 'biochemical' ? (
            /* Biochemical: BOD (mg/L) & Phosphate (mg/L) */
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="bodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              
              {/* Left Y Axis for BOD */}
              <YAxis
                yAxisId="left"
                domain={[0, 16]}
                stroke="#06b6d4"
                tick={{ fill: '#06b6d4', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'BOD (mg/L)', angle: -90, position: 'insideLeft', fill: '#06b6d4', fontSize: 10, offset: 25 }}
              />

              {/* Right Y Axis for Phosphate */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1.4]}
                stroke="#14b8a6"
                tick={{ fill: '#14b8a6', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'Phosphate (mg/L)', angle: 90, position: 'insideRight', fill: '#14b8a6', fontSize: 10, offset: 20 }}
              />

              <ReferenceLine
                yAxisId="left"
                y={3.5}
                stroke="#06b6d4"
                strokeDasharray="3 3"
                strokeOpacity={0.7}
                label={{ value: 'Clean Stream BOD (<3.5)', fill: '#06b6d4', fontSize: 9, position: 'insideTopLeft' }}
              />
              <ReferenceLine
                yAxisId="left"
                y={8.0}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Critical Organic Limit (BOD ≥ 8.0)', fill: '#f43f5e', fontSize: 9, position: 'insideBottomRight' }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Area
                yAxisId="left"
                type="monotone"
                dataKey="bodLevel"
                name="BOD (mg/L)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fill="url(#bodGradient)"
                dot={{ r: 2.5, fill: '#06b6d4' }}
                activeDot={{ r: 5, fill: '#22d3ee', stroke: '#ffffff' }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="phosphateLevel"
                name="Phosphate (mg/L)"
                stroke="#14b8a6"
                strokeWidth={2}
                dot={{ r: 2, fill: '#14b8a6' }}
                activeDot={{ r: 5, fill: '#2dd4bf', stroke: '#ffffff' }}
              />
            </ComposedChart>
          ) : activeTab === 'gas-toxicity' ? (
            /* Gas Toxicity: H2S (ppm) & Methane (% LEL) */
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="methaneGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              
              {/* Left Y Axis for H2S */}
              <YAxis
                yAxisId="left"
                domain={[0, 0.22]}
                stroke="#eab308"
                tick={{ fill: '#eab308', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'H₂S (ppm)', angle: -90, position: 'insideLeft', fill: '#eab308', fontSize: 10, offset: 25 }}
              />

              {/* Right Y Axis for Methane */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 5.5]}
                stroke="#f97316"
                tick={{ fill: '#f97316', fontSize: 11, fontFamily: 'monospace' }}
                tickLine={false}
                label={{ value: 'CH₄ (% LEL)', angle: 90, position: 'insideRight', fill: '#f97316', fontSize: 10, offset: 20 }}
              />

              <ReferenceLine
                yAxisId="left"
                y={0.08}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Toxic H₂S Limit (≥0.08 ppm)', fill: '#f43f5e', fontSize: 9, position: 'insideTopLeft' }}
              />
              <ReferenceLine
                yAxisId="right"
                y={3.0}
                stroke="#f43f5e"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{ value: 'Critical CH₄ Plume (≥3.0% LEL)', fill: '#f43f5e', fontSize: 9, position: 'insideBottomRight' }}
              />

              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="h2sLevel"
                name="H₂S (ppm)"
                stroke="#eab308"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: '#eab308' }}
                activeDot={{ r: 5, fill: '#facc15', stroke: '#ffffff' }}
              />

              <Area
                yAxisId="right"
                type="monotone"
                dataKey="methaneLevel"
                name="Methane (% LEL)"
                stroke="#f97316"
                strokeWidth={2}
                fill="url(#methaneGradient)"
                dot={{ r: 2, fill: '#f97316' }}
                activeDot={{ r: 5, fill: '#fb923c', stroke: '#ffffff' }}
              />
            </ComposedChart>
          ) : activeTab === 'turbidity-do' ? (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fill: '#06b6d4', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#38bdf8" tick={{ fill: '#38bdf8', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
              <Area yAxisId="left" type="monotone" dataKey="turbidity" name="Turbidity (NTU)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="dissolvedOxygen" name="Dissolved O₂ (mg/L)" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2 }} />
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} />
              <XAxis dataKey="timestamp" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis stroke="#10b981" tick={{ fill: '#10b981', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }} />
              <Area type="stepAfter" dataKey="trashCollectedKg" name="Cumulative Trash (kg)" stroke="#10b981" fill="#10b981" fillOpacity={0.25} strokeWidth={2.5} />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Bottom Summary Indicators */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
          <div>
            <span>Min pH: </span>
            <span className={`font-bold ${minPh < 6.0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {minPh.toFixed(2)}
            </span>
          </div>
          <div>
            <span>Avg BOD: </span>
            <span className="text-cyan-300 font-bold">{avgBod.toFixed(2)} mg/L</span>
          </div>
          <div>
            <span>Max H₂S: </span>
            <span className={`font-bold ${maxH2s >= 0.08 ? 'text-rose-400' : 'text-yellow-300'}`}>
              {maxH2s.toFixed(3)} ppm
            </span>
          </div>
          <div>
            <span>Max CH₄: </span>
            <span className="text-orange-300 font-bold">{maxMethane.toFixed(2)}% LEL</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>EPA / CPCB Multi-Sensor Regulatory Baseline Active</span>
        </div>
      </div>

    </div>
  );
};
