import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  FileText,
  Loader2,
  MapPin,
  Send,
  ShieldAlert,
  X
} from 'lucide-react';
import { AlertLog } from '../types';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface AuthorityModalProps {
  alert: AlertLog | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmNotify: (alertId: string, agency: string) => void;
}

export const AuthorityModal: React.FC<AuthorityModalProps> = ({
  alert,
  isOpen,
  onClose,
  onConfirmNotify,
}) => {
  const [selectedAgency, setSelectedAgency] = useState<string>(
    'EPA Region 1 Emergency Environmental Response Center'
  );
  const [urgencyLevel, setUrgencyLevel] = useState<'CRITICAL' | 'URGENT'>('CRITICAL');
  const [notes, setNotes] = useState<string>(
    'Autonomous surface robot detected sharp acidic plume exceeding regulatory thresholds. Immediate tributary runoff inspection recommended.'
  );
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen || !alert) return null;

  const handleSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setIsSuccess(true);
      setTimeout(() => {
        onConfirmNotify(alert.id, selectedAgency);
        setIsSuccess(false);
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <TrashTrekkerLogo size="sm" />
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Official Incident Dispatch Notice
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                TrashTrekker Autonomous Rapid Response Protocol
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="text-base font-bold text-emerald-400">
              Authorities Notified Successfully
            </h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Incident Report #{alert.id.slice(-8).toUpperCase()} transmitted to{' '}
              <span className="text-slate-200 font-semibold">{selectedAgency}</span>. Automated dispatch ticket generated.
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-3 text-xs">
            
            {/* Incident Summary Card */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                <span className="text-slate-400">Incident Telemetry Snapshot</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  pH {alert.ph.toFixed(2)} ACID SPIKE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Timestamp</span>
                  <span className="font-mono font-semibold">{alert.timestamp} (UTC-4)</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">River Sector</span>
                  <span className="font-semibold truncate block">{alert.zone}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">GPS Coordinates</span>
                  <span className="font-mono text-emerald-400">{alert.lat.toFixed(5)}, {alert.lng.toFixed(5)}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">Turbidity / Temp</span>
                  <span className="font-mono">{alert.turbidity || '38.2'} NTU | {alert.temperature}°C</span>
                </div>
                {(alert.bodLevel !== undefined || alert.h2sLevel !== undefined) && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">BOD / H₂S Toxicity</span>
                    <span className="font-mono text-cyan-300">
                      {alert.bodLevel?.toFixed(1) ?? '2.4'} mg/L | {alert.h2sLevel?.toFixed(3) ?? '0.008'} ppm
                    </span>
                  </div>
                )}
                {(alert.methaneLevel !== undefined || alert.phosphateLevel !== undefined) && (
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase block">Methane / Phosphate</span>
                    <span className="font-mono text-amber-300">
                      {alert.methaneLevel?.toFixed(2) ?? '0.45'}% LEL | {alert.phosphateLevel?.toFixed(2) ?? '0.09'} mg/L
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Target Authority Selector */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                Target Environmental Agency
              </label>
              <select
                value={selectedAgency}
                onChange={(e) => setSelectedAgency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="EPA Region 1 Emergency Environmental Response Center">
                  EPA Region 1 Emergency Environmental Response Center
                </option>
                <option value="State Department of Environmental Protection (DEP)">
                  State Department of Environmental Protection (DEP)
                </option>
                <option value="Municipal Water Works & Drinking Reservoir Command">
                  Municipal Water Works & Drinking Reservoir Command
                </option>
                <option value="Coast Guard Marine Environmental Protection Unit">
                  Coast Guard Marine Environmental Protection Unit
                </option>
              </select>
            </div>

            {/* Response Recommendations & Notes */}
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Automated Incident Report Note
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-2.5 text-slate-300 text-xs focus:outline-none focus:border-emerald-500 resize-none font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSending}
                className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-medium text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSend}
                disabled={isSending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch Emergency Alert</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
