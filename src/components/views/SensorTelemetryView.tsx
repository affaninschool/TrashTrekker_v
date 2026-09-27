import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  Droplets,
  FileSpreadsheet,
  Filter,
  Flame,
  Gauge,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Sliders,
  Sparkles,
  Thermometer,
  Trash2,
  Waves,
  Zap
} from 'lucide-react';
import { TelemetryPoint } from '../../types';
import { SensorGrid } from '../SensorGrid';
import { TelemetryChart } from '../TelemetryChart';

interface SensorTelemetryViewProps {
  currentPoint: TelemetryPoint;
  history: TelemetryPoint[];
  onTriggerSpike: () => void;
  onOpenConfigModal: () => void;
}

export const SensorTelemetryView: React.FC<SensorTelemetryViewProps> = ({
  currentPoint,
  history,
  onTriggerSpike,
  onOpenConfigModal,
}) => {
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'CRITICAL' | 'NORMAL'>('ALL');

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Timestamp',
      'pH',
      'Temperature_C',
      'Turbidity_NTU',
      'DissolvedOxygen_mgL',
      'BOD_mgL',
      'H2S_ppm',
      'Methane_LEL',
      'Phosphate_mgL',
      'Battery_Pct',
      'Trash_kg',
      'Latitude',
      'Longitude',
      'Status',
    ];

    const rows = history.map((pt) => [
      pt.timestamp,
      pt.ph.toFixed(2),
      pt.temperature.toFixed(1),
      pt.turbidity,
      pt.dissolvedOxygen.toFixed(1),
      pt.bodLevel?.toFixed(2) || '2.40',
      pt.h2sLevel?.toFixed(3) || '0.008',
      pt.methaneLevel?.toFixed(2) || '0.45',
      pt.phosphateLevel?.toFixed(2) || '0.09',
      pt.battery,
      pt.trashCollectedKg,
      pt.lat.toFixed(5),
      pt.lng.toFixed(5),
      pt.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TrashTrekker_Telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter((pt) => {
    const matchesSearch =
      pt.timestamp.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (pt.locationName && pt.locationName.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (pt.nearestLandmark && pt.nearestLandmark.toLowerCase().includes(searchFilter.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'CRITICAL'
        ? pt.status === 'critical'
        : pt.status !== 'critical';

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-cyan-400" />
              Real-Time Hydrochemical Analysis
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Balurghat WQMS Array • 1-Sec Polling
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Sensor Telemetry & Water Quality Diagnostics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous spectroscopic assessment tracking pH equilibrium, dissolved oxygen saturation, turbidity, and biochemical indicators.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenConfigModal}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            Alert Thresholds
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold border border-emerald-500/40 flex items-center gap-2 shadow-md transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Telemetry CSV
          </button>
        </div>
      </div>

      {/* Real-time Metric Cards Array */}
      <SensorGrid currentPoint={currentPoint} />

      {/* Minimalist Multi-Parameter Chart Visualizer */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl">
        <TelemetryChart history={history} pointLimit={30} />
      </div>

      {/* Historical Telemetry Stream Table */}
      <div className="rounded-3xl border border-slate-800/90 bg-slate-950/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl space-y-4">
        
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              Historical Hydrochemical Telemetry Feed ({filteredHistory.length} readings)
            </h3>
            <p className="text-xs text-slate-400">
              Synchronized readings recorded along autonomous cleaning sweep paths.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search timestamp, landmark..."
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-48"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
              {(['ALL', 'CRITICAL', 'NORMAL'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all ${
                    statusFilter === filter
                      ? 'bg-cyan-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Data Table */}
        <div className="overflow-x-auto max-h-96 scrollbar-thin">
          <table className="w-full text-left text-xs font-mono">
            <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-md text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">pH Level</th>
                <th className="py-2.5 px-3 font-semibold">Temp (°C)</th>
                <th className="py-2.5 px-3 font-semibold">Turbidity (NTU)</th>
                <th className="py-2.5 px-3 font-semibold">DO (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold">BOD (mg/L)</th>
                <th className="py-2.5 px-3 font-semibold">Trash Skimmed</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredHistory.slice(-25).reverse().map((pt, idx) => {
                const isCritical = pt.status === 'critical' || pt.ph < 6.0 || pt.turbidity > 35;
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-900/50 transition-colors ${
                      isCritical ? 'bg-rose-500/5 text-rose-300' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-400">{pt.timestamp}</td>
                    <td className={`py-2.5 px-3 font-bold ${pt.ph < 6.0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {pt.ph.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-amber-300">{pt.temperature}°C</td>
                    <td className="py-2.5 px-3 text-cyan-300">{pt.turbidity} NTU</td>
                    <td className="py-2.5 px-3 text-emerald-300">{pt.dissolvedOxygen} mg/L</td>
                    <td className="py-2.5 px-3 text-sky-300">{(pt.bodLevel ?? 2.4).toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{pt.trashCollectedKg} kg</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}
                      >
                        {isCritical ? 'ALERT' : 'NOMINAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
