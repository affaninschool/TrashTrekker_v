import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  ExternalLink,
  FileDown,
  FileText,
  Mail,
  MapPin,
  Phone,
  Radio,
  Send,
  ShieldAlert,
  Sliders,
  Sparkles,
  Timer,
  Trash2
} from 'lucide-react';
import { AlertConfig, AlertLog } from '../types';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface EmergencyAlertsLogProps {
  alerts: AlertLog[];
  onOpenNotifyModal: (alert: AlertLog) => void;
  onLocateOnMap?: (coords: [number, number]) => void;
  onDismissAlert?: (alertId: string) => void;
  onTriggerManualSpike: () => void;
  onExportPDF?: () => void;
  onOpenReportModal?: () => void;
  alertConfig?: AlertConfig;
  onOpenConfigModal?: () => void;
}

export const EmergencyAlertsLog: React.FC<EmergencyAlertsLogProps> = ({
  alerts,
  onOpenNotifyModal,
  onLocateOnMap,
  onDismissAlert,
  onTriggerManualSpike,
  onExportPDF,
  onOpenReportModal,
  alertConfig,
  onOpenConfigModal,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'notified'>('all');
  const [fakeWarningTimer, setFakeWarningTimer] = useState<number>(10);
  const [lastCycleTimestamp, setLastCycleTimestamp] = useState<string>(
    new Date().toLocaleTimeString('en-US', { hour12: false })
  );

  // Fake Warning Timer loop ticking down every second, cycling every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setFakeWarningTimer((prev) => {
        if (prev <= 1) {
          setLastCycleTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }));
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const seenIds = new Set<string>();
  const uniqueAlerts = alerts.filter((a) => {
    if (seenIds.has(a.id)) return false;
    seenIds.add(a.id);
    return true;
  });

  const pendingCount = uniqueAlerts.filter((a) => !a.notified).length;
  const filteredAlerts = uniqueAlerts.filter((a) => {
    if (filter === 'pending') return !a.notified;
    if (filter === 'notified') return a.notified;
    return true;
  });

  const handleTestAlertTrigger = () => {
    setFakeWarningTimer(10);
    setLastCycleTimestamp(new Date().toLocaleTimeString('en-US', { hour12: false }));
    onTriggerManualSpike();
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 shadow-lg shadow-black/20 flex flex-col justify-between h-full">
      
      {/* Header */}
      <div className="flex flex-col gap-2 pb-3 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <TrashTrekkerLogo size="xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                  Emergency Incident & Plume Dispatch Log
                </h2>
                {pendingCount > 0 ? (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">
                    {pendingCount} NEW
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                    ALL CLEAR
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                TrashTrekker automated chemical threshold breaches & agency dispatches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {/* Configure Thresholds Modal Button */}
            {onOpenConfigModal && (
              <button
                onClick={onOpenConfigModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-300 hover:border-emerald-500/40 text-xs font-semibold transition-colors"
                title="Configure custom pH limits and email/SMS notification opt-ins"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rules & Opt-Ins</span>
              </button>
            )}

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-950/60 rounded-lg p-0.5 border border-slate-800 text-xs">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'all'
                    ? 'bg-slate-800 text-slate-200'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                All ({uniqueAlerts.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter === 'pending'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter('notified')}
                className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                  filter === 'notified'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                Dispatched ({uniqueAlerts.length - pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Prominent Orange Banner: TEST ALERT: Simulating Fake Spill Detected */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-200 shadow-sm mt-1">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  TEST ALERT: Simulating Spill Detected
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/30 text-amber-100 px-2 py-0.5 rounded border border-amber-500/50">
                  {fakeWarningTimer}s
                </span>
              </div>
              <p className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                Simulated trigger countdown: 10s cycle · Last mark: {lastCycleTimestamp}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestAlertTrigger}
            className="self-end sm:self-center shrink-0 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-amber-500/25 hover:bg-amber-500/35 text-amber-100 border border-amber-500/50 transition-colors shadow flex items-center gap-1"
          >
            <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
            <span>Simulate Spill</span>
          </button>
        </div>

        {/* Active Threshold Strip */}
        {alertConfig && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px] text-slate-400 bg-slate-950/40 px-2.5 py-1 rounded-lg border border-slate-800/60 font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-sans">Active Limits:</span>
              <span className="text-rose-400 font-semibold">≤ {alertConfig.criticalAcidPh.toFixed(1)} pH</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">{alertConfig.warningAcidPh.toFixed(1)} – {alertConfig.warningAlkalinePh.toFixed(1)} pH</span>
              <span className="text-slate-600">|</span>
              <span className="text-rose-400 font-semibold">≥ {alertConfig.criticalAlkalinePh.toFixed(1)} pH</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-400">
                <Mail className="w-3 h-3 text-cyan-400" />
                {alertConfig.emailNotifications.critical ? 'Email ON' : 'Email OFF'}
              </span>
              <span className="flex items-center gap-1 text-slate-400">
                <Phone className="w-3 h-3 text-emerald-400" />
                {alertConfig.smsNotifications.critical ? 'SMS ON' : 'SMS OFF'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Alerts Scrollable List */}
      <div className="my-3 space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {filteredAlerts.length === 0 ? (
          <div className="py-10 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800/60 p-4">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-300 font-medium">
              No active emergency alerts in this view.
            </div>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              Simulate an illegal chemical discharge spike to test the real-time authority notification workflow.
            </p>
            <button
              onClick={onTriggerManualSpike}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-colors uppercase tracking-wider"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Simulate Chemical Spike
            </button>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isNotified = alert.notified;

            return (
              <div
                key={alert.id}
                className={`relative rounded-lg border-l-2 p-3 transition-all duration-200 flex flex-col gap-2 ${
                  isNotified
                    ? 'bg-slate-800/40 border-l-slate-500 border border-slate-800/80 text-slate-300'
                    : 'bg-rose-500/10 border-l-rose-500 border border-rose-500/20 text-slate-100'
                }`}
              >
                {/* Top Row: Timestamp, Severity, GPS, Map locate */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono uppercase tracking-wider ${
                        isNotified ? 'text-slate-400' : 'text-rose-500'
                      }`}
                    >
                      {isNotified ? 'DISPATCHED_EVENT' : 'CRITICAL SPIKE'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {alert.timestamp}
                    </span>
                  </div>

                  {/* GPS & Locate on Map */}
                  <button
                    onClick={() => onLocateOnMap?.([alert.lat, alert.lng])}
                    className="flex items-center gap-1 font-mono text-[10px] text-slate-400 hover:text-emerald-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800 transition-colors"
                    title="Focus map on this coordinate"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    <span>{alert.lat.toFixed(4)}, {alert.lng.toFixed(4)}</span>
                  </button>
                </div>

                {/* Main Alert Description & Telemetry Values */}
                <p className="text-xs text-slate-200 leading-tight">
                  {alert.description}
                </p>

                {/* Telemetry pill badges */}
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-rose-400 font-bold">
                    pH: {alert.ph.toFixed(2)}
                  </span>
                  {alert.bodLevel !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-400">
                      BOD: {alert.bodLevel.toFixed(1)} mg/L
                    </span>
                  )}
                  {alert.h2sLevel !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-yellow-400">
                      H₂S: {alert.h2sLevel.toFixed(3)} ppm
                    </span>
                  )}
                  {alert.methaneLevel !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-orange-400">
                      CH₄: {alert.methaneLevel.toFixed(2)}% LEL
                    </span>
                  )}
                  {alert.phosphateLevel !== undefined && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-400">
                      PO₄³⁻: {alert.phosphateLevel.toFixed(2)} mg/L
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-sky-400">
                    Temp: {alert.temperature}°C
                  </span>
                  {alert.turbidity && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                      Turbidity: {alert.turbidity} NTU
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                    {alert.zone}
                  </span>
                </div>

                {/* Bottom Row: Authority Notification Status & Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800">
                  {isNotified ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>
                        Transmitted {alert.notifiedAt ? `(${alert.notifiedAt})` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Action Required</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    {!isNotified ? (
                      <button
                        onClick={() => onOpenNotifyModal(alert)}
                        className="py-1.5 px-3 bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold rounded uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Notify Authorities
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenNotifyModal(alert)}
                        className="py-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold rounded uppercase tracking-wider border border-slate-700 transition-colors"
                      >
                        Receipt
                      </button>
                    )}

                    {/* Dismiss alert */}
                    {onDismissAlert && (
                      <button
                        onClick={() => onDismissAlert(alert.id)}
                        className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                        title="Dismiss alert log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Footer Info / Emergency Protocols & Report Export */}
      <div className="pt-2.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>EPA Hotline: 1-800-424-8802</span>
          </div>

          {onExportPDF && (
            <button
              onClick={onExportPDF}
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              title="Download comprehensive incident summary PDF report"
            >
              <FileDown className="w-3 h-3" />
              <span>Summary PDF</span>
            </button>
          )}
        </div>

        <button
          onClick={onTriggerManualSpike}
          className="text-xs text-rose-400 hover:text-rose-300 font-medium underline underline-offset-2"
        >
          + Test Spike
        </button>
      </div>

    </div>
  );
};
