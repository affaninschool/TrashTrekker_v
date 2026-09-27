import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  Mail,
  Phone,
  RotateCcw,
  Save,
  Send,
  Settings2,
  Shield,
  Sliders,
  Sparkles,
  Volume2,
  X,
  Zap
} from 'lucide-react';
import { AlertConfig } from '../types';
import { DEFAULT_ALERT_CONFIG } from '../utils/simulation';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AlertConfig;
  onSaveConfig: (newConfig: AlertConfig) => void;
  onTriggerTestSpike?: () => void;
}

export const AlertConfigModal: React.FC<AlertConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onTriggerTestSpike,
}) => {
  const [formData, setFormData] = useState<AlertConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'thresholds' | 'notifications' | 'dispatch'>('thresholds');
  const [showSavedToast, setShowSavedToast] = useState<boolean>(false);

  // Sync state if modal opens with different config
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...config });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveConfig(formData);
    setShowSavedToast(true);
    setTimeout(() => {
      setShowSavedToast(false);
      onClose();
    }, 900);
  };

  const handleResetDefaults = () => {
    setFormData({ ...DEFAULT_ALERT_CONFIG });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-5 sm:p-6 text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <TrashTrekkerLogo size="sm" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                Emergency Alert Rules & Protocols
              </h2>
              <p className="text-xs text-slate-400">
                TrashTrekker autonomous hydrochemical safety thresholds
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 mt-3 pt-1 shrink-0 gap-1 sm:gap-2 text-xs">
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'thresholds'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>pH & Sensor Thresholds</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Email & SMS Opt-Ins</span>
          </button>

          <button
            onClick={() => setActiveTab('dispatch')}
            className={`px-3.5 py-2 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'dispatch'
                ? 'border-rose-400 text-rose-300 bg-rose-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Auto Authority Dispatch</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 text-xs">
          
          {/* TAB 1: Threshold Limits */}
          {activeTab === 'thresholds' && (
            <div className="space-y-4">
              
              {/* Visual Threshold Spectrum Preview Bar */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400 font-sans font-semibold">Active pH Safety Envelope</span>
                  <span className="text-emerald-400 font-bold">
                    Safe Band: {formData.warningAcidPh.toFixed(2)} – {formData.warningAlkalinePh.toFixed(2)} pH
                  </span>
                </div>

                {/* Color Spectrum Bar */}
                <div className="h-4 rounded-full w-full flex overflow-hidden border border-slate-700/60 font-mono text-[9px] text-center font-bold">
                  <div
                    style={{ width: `${((formData.criticalAcidPh - 3.5) / 7.5) * 100}%` }}
                    className="bg-rose-600 text-white flex items-center justify-center truncate"
                    title={`Critical Acidic (< ${formData.criticalAcidPh.toFixed(1)})`}
                  >
                    CRIT
                  </div>
                  <div
                    style={{ width: `${((formData.warningAcidPh - formData.criticalAcidPh) / 7.5) * 100}%` }}
                    className="bg-amber-500 text-slate-950 flex items-center justify-center truncate"
                    title={`Acidic Warning (${formData.criticalAcidPh.toFixed(1)} - ${formData.warningAcidPh.toFixed(1)})`}
                  >
                    WARN
                  </div>
                  <div
                    style={{ width: `${((formData.warningAlkalinePh - formData.warningAcidPh) / 7.5) * 100}%` }}
                    className="bg-emerald-500 text-slate-950 flex items-center justify-center truncate"
                    title={`Optimal Safety (${formData.warningAcidPh.toFixed(1)} - ${formData.warningAlkalinePh.toFixed(1)})`}
                  >
                    SAFE WATER
                  </div>
                  <div
                    style={{ width: `${((formData.criticalAlkalinePh - formData.warningAlkalinePh) / 7.5) * 100}%` }}
                    className="bg-amber-500 text-slate-950 flex items-center justify-center truncate"
                    title={`Alkaline Warning (${formData.warningAlkalinePh.toFixed(1)} - ${formData.criticalAlkalinePh.toFixed(1)})`}
                  >
                    WARN
                  </div>
                  <div
                    style={{ width: `${((11.0 - formData.criticalAlkalinePh) / 7.5) * 100}%` }}
                    className="bg-rose-600 text-white flex items-center justify-center truncate"
                    title={`Critical Alkaline (> ${formData.criticalAlkalinePh.toFixed(1)})`}
                  >
                    CRIT
                  </div>
                </div>

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>3.5 pH (High Acid)</span>
                  <span>7.0 pH (Neutral)</span>
                  <span>11.0 pH (High Caustic)</span>
                </div>
              </div>

              {/* pH Threshold Sliders & Numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* 1. Critical Acidic Limit */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-rose-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Critical Acid Limit
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      ≤ {formData.criticalAcidPh.toFixed(2)} pH
                    </span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="6.4"
                    step="0.05"
                    value={formData.criticalAcidPh}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        criticalAcidPh: val,
                        warningAcidPh: Math.max(val + 0.1, prev.warningAcidPh),
                      }));
                    }}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Triggers immediate emergency EPA and CPCB illegal chemical outfall dispatches.
                  </p>
                </div>

                {/* 2. Warning Acidic Limit */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warning Acid Limit
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      ≤ {formData.warningAcidPh.toFixed(2)} pH
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5.5"
                    max="6.8"
                    step="0.05"
                    value={formData.warningAcidPh}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        warningAcidPh: val,
                        criticalAcidPh: Math.min(val - 0.1, prev.criticalAcidPh),
                      }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Sub-optimal aquatic runoff. Enters advisory telemetry recording mode.
                  </p>
                </div>

                {/* 3. Warning Alkaline Limit */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Warning Alkaline Limit
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                      ≥ {formData.warningAlkalinePh.toFixed(2)} pH
                    </span>
                  </div>
                  <input
                    type="range"
                    min="7.8"
                    max="8.8"
                    step="0.05"
                    value={formData.warningAlkalinePh}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        warningAlkalinePh: val,
                        criticalAlkalinePh: Math.max(val + 0.2, prev.criticalAlkalinePh),
                      }));
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Approaching upper alkalinity limits (industrial wash / detergent plumes).
                  </p>
                </div>

                {/* 4. Critical Alkaline Limit */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-rose-400 flex items-center gap-1.5">
                      <AlertOctagon className="w-3.5 h-3.5" />
                      Critical Alkaline Limit
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      ≥ {formData.criticalAlkalinePh.toFixed(2)} pH
                    </span>
                  </div>
                  <input
                    type="range"
                    min="8.5"
                    max="10.5"
                    step="0.05"
                    value={formData.criticalAlkalinePh}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData((prev) => ({
                        ...prev,
                        criticalAlkalinePh: val,
                        warningAlkalinePh: Math.min(val - 0.2, prev.warningAlkalinePh),
                      }));
                    }}
                    className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Caustic contamination alarm requiring immediate spill barrier deployment.
                  </p>
                </div>

              </div>

              {/* Secondary Sensor Limits: Turbidity & Dissolved Oxygen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                
                {/* Turbidity */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-cyan-400">
                      Max Allowed Turbidity
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      ≥ {formData.criticalTurbidity} NTU
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="1"
                    value={formData.criticalTurbidity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        criticalTurbidity: parseInt(e.target.value, 10),
                      }))
                    }
                    className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Particulate density & sediment plume alarm threshold.
                  </p>
                </div>

                {/* Dissolved Oxygen */}
                <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-emerald-400">
                      Min Dissolved Oxygen (DO)
                    </label>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      ≤ {formData.minDissolvedOxygen.toFixed(1)} mg/L
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2.0"
                    max="8.0"
                    step="0.2"
                    value={formData.minDissolvedOxygen}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        minDissolvedOxygen: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-500">
                    Hypoxia risk threshold for fish & aquatic biology survival.
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: Notifications Opt-Ins (Email & SMS) */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              
              {/* Email Section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Automated Email Dispatches
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">SMTP Relay Active</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Recipient Emergency Mailing List / Environmental Desk
                  </label>
                  <input
                    type="email"
                    value={formData.emailNotifications.recipientEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        emailNotifications: {
                          ...prev.emailNotifications,
                          recipientEmail: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g. response-center@environment.gov"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                {/* Email Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  
                  <label className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.critical}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emailNotifications: {
                            ...prev.emailNotifications,
                            critical: e.target.checked,
                          },
                        }))
                      }
                      className="mt-0.5 accent-rose-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Critical Spikes</span>
                      <span className="text-[10px] text-slate-400">Instant PDF report & coordinates</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.warning}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emailNotifications: {
                            ...prev.emailNotifications,
                            warning: e.target.checked,
                          },
                        }))
                      }
                      className="mt-0.5 accent-amber-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Warning Alerts</span>
                      <span className="text-[10px] text-slate-400">Sub-threshold notifications</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.emailNotifications.dailyDigest}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          emailNotifications: {
                            ...prev.emailNotifications,
                            dailyDigest: e.target.checked,
                          },
                        }))
                      }
                      className="mt-0.5 accent-emerald-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Daily Digest</span>
                      <span className="text-[10px] text-slate-400">24-hour river basin overview</span>
                    </div>
                  </label>

                </div>
              </div>

              {/* SMS Notification Section */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                      Automated SMS & Pager Alerts
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-500">Twilio / GovGateway Link</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-400 block">
                    Rapid Response Officer Mobile Phone / SMS Gateway
                  </label>
                  <input
                    type="tel"
                    value={formData.smsNotifications.recipientPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        smsNotifications: {
                          ...prev.smsNotifications,
                          recipientPhone: e.target.value,
                        },
                      }))
                    }
                    placeholder="+91 98765 43210 or +1 555 234 8900"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>

                {/* SMS Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  
                  <label className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications.critical}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          smsNotifications: {
                            ...prev.smsNotifications,
                            critical: e.target.checked,
                          },
                        }))
                      }
                      className="mt-0.5 accent-rose-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Critical Priority SMS</span>
                      <span className="text-[10px] text-slate-400">Direct phone ping on severe acid/alkali spill</span>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={formData.smsNotifications.warning}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          smsNotifications: {
                            ...prev.smsNotifications,
                            warning: e.target.checked,
                          },
                        }))
                      }
                      className="mt-0.5 accent-amber-500 rounded"
                    />
                    <div>
                      <span className="font-bold text-slate-200 text-xs block">Warning Level SMS</span>
                      <span className="text-[10px] text-slate-400">Send SMS on secondary threshold breach</span>
                    </div>
                  </label>

                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Auto Authority Dispatch */}
          {activeTab === 'dispatch' && (
            <div className="space-y-4">
              
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-4">
                
                {/* Auto-Dispatch Master Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider">
                        Autonomous Emergency Dispatch Protocol
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Automatically notify environmental protection agencies immediately upon critical sensor breach
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoDispatchAuthorities}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          autoDispatchAuthorities: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                  </label>
                </div>

                {/* Target Agency Dropdown */}
                <div className="space-y-2">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    Designated Regional Response Agency
                  </label>
                  <select
                    value={formData.dispatchAgency}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dispatchAgency: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Central Pollution Control Board (CPCB) & State Pollution Control Board (SPCB) India">
                      Central Pollution Control Board (CPCB) & SPCB India (National River Conservation)
                    </option>
                    <option value="Namami Gange National Mission for Clean Ganga (NMCG) Emergency Wing">
                      Namami Gange Mission (NMCG) Rapid Response Wing
                    </option>
                    <option value="EPA Region 1 Emergency Environmental Response Center">
                      EPA Emergency Environmental Response Center (USA Clean Water Act § 311)
                    </option>
                    <option value="State Department of Environmental Protection (DEP)">
                      State Department of Environmental Protection (DEP)
                    </option>
                    <option value="UK Environment Agency & Thames Estuary Water Protection">
                      UK Environment Agency & Thames Water Protection
                    </option>
                  </select>
                </div>

                {/* Compliance Disclaimer */}
                <div className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 flex items-start gap-2.5 text-[11px] text-slate-300">
                  <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    When autonomous dispatch is active, the marine drone transmits signed LoRaWAN telemetry packages and PDF compliance certificates directly to regulatory endpoints with zero operator latency.
                  </p>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 border border-slate-800"
              title="Reset all thresholds and notifications to baseline standard"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            {onTriggerTestSpike && (
              <button
                onClick={() => {
                  onTriggerTestSpike();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors flex items-center justify-center gap-1.5 border border-rose-500/20"
                title="Test trigger a simulated chemical plume spike using current rules"
              >
                <Zap className="w-3.5 h-3.5 text-rose-400" />
                <span>Test Alert Spike</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              {showSavedToast ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
