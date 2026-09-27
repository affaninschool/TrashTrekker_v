import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Key,
  Shield,
  Radio,
  Wifi,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Zap,
  Terminal,
  Code2,
  Battery,
  Signal,
  CheckCircle2,
  AlertTriangle,
  Send,
  Sliders,
  Play,
  RotateCcw,
  X,
  Laptop
} from 'lucide-react';
import { RobotDevice, RiverSector } from '../types';
import { RIVER_SECTORS } from '../utils/simulation';
import { TrashTrekkerLogo } from './TrashTrekkerLogo';

interface DevicePairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLiveHardwareMode: boolean;
  onToggleLiveHardwareMode: (enabled: boolean) => void;
  onTelemetryIngested?: (point: any) => void;
}

export const DevicePairingModal: React.FC<DevicePairingModalProps> = ({
  isOpen,
  onClose,
  isLiveHardwareMode,
  onToggleLiveHardwareMode,
  onTelemetryIngested,
}) => {
  const [activeTab, setActiveTab] = useState<'paired' | 'pair_new' | 'secret_codes' | 'api_docs' | 'test_hook'>('paired');
  const [devices, setDevices] = useState<RobotDevice[]>([]);
  const [loadingDevices, setLoadingDevices] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New pairing form state
  const [newDeviceId, setNewDeviceId] = useState<string>('BOT-TT-10');
  const [newDeviceName, setNewDeviceName] = useState<string>('TrashTrekker MK-IV Secondary');
  const [newDeviceModel, setNewDeviceModel] = useState<string>('Autonomous Marine Sweeper MK-IV');
  const [newHardwareType, setNewHardwareType] = useState<string>('MARK_IV_SWEEPER');
  const [newSecretKey, setNewSecretKey] = useState<string>('TT-SEC-8491-K2');
  const [newSectorId, setNewSectorId] = useState<string>('ganges-varanasi');
  const [pairingStatus, setPairingStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  // Generated Secret Code state
  const [generatedSecret, setGeneratedSecret] = useState<string>('TT-SEC-9842-X7');
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);

  // Test Ingest state
  const [testRobotId, setTestRobotId] = useState<string>('BOT-TT-09');
  const [testSecret, setTestSecret] = useState<string>('TT-SEC-9842-X7');
  const [testPh, setTestPh] = useState<number>(7.45);
  const [testTurbidity, setTestTurbidity] = useState<number>(8.5);
  const [testBattery, setTestBattery] = useState<number>(96);
  const [testTrashKg, setTestTrashKg] = useState<number>(18.5);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Code snippets tab state
  const [snippetLanguage, setSnippetLanguage] = useState<'curl' | 'python' | 'esp32' | 'nodejs'>('curl');

  // Fetch paired devices from server
  const fetchDevices = async () => {
    setLoadingDevices(true);
    try {
      const res = await fetch('/api/robot/devices');
      const data = await res.json();
      if (data.devices) {
        setDevices(data.devices);
      }
    } catch (e) {
      console.error('Error fetching devices:', e);
    } finally {
      setLoadingDevices(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleGenerateNewKey = async () => {
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/robot/generate-key', { method: 'POST' });
      const data = await res.json();
      if (data.secretKey) {
        setGeneratedSecret(data.secretKey);
        setNewSecretKey(data.secretKey);
        setTestSecret(data.secretKey);
      }
    } catch (e) {
      console.error('Error generating secret code:', e);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handlePairDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairingStatus(null);

    try {
      const res = await fetch('/api/robot/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newDeviceId,
          name: newDeviceName,
          model: newDeviceModel,
          hardwareType: newHardwareType,
          secretKey: newSecretKey,
          assignedSectorId: newSectorId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPairingStatus({ success: true, message: `Device ${newDeviceId} successfully paired!` });
        await fetchDevices();
        setTimeout(() => {
          setActiveTab('paired');
          setPairingStatus(null);
        }, 1200);
      } else {
        setPairingStatus({ success: false, message: data.error || 'Failed to pair device.' });
      }
    } catch (e: any) {
      setPairingStatus({ success: false, message: e.message || 'Network error.' });
    }
  };

  const handleUnpair = async (id: string) => {
    if (!confirm(`Are you sure you want to disconnect & revoke robot "${id}"?`)) return;
    try {
      await fetch(`/api/robot/devices/${id}`, { method: 'DELETE' });
      await fetchDevices();
    } catch (e) {
      console.error('Failed to unpair device:', e);
    }
  };

  const handleSendCommand = async (robotId: string, commandType: string) => {
    try {
      const res = await fetch('/api/robot/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotId, commandType }),
      });
      const data = await res.json();
      alert(`Command "${commandType}" sent to ${robotId}!\nStatus: Queued for execution.`);
    } catch (e: any) {
      alert(`Failed to send command: ${e.message}`);
    }
  };

  const handleSendTestTelemetry = async () => {
    setTestSending(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/robot/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Robot-Secret': testSecret,
        },
        body: JSON.stringify({
          robotId: testRobotId,
          secretKey: testSecret,
          ph: testPh,
          turbidity: testTurbidity,
          battery: testBattery,
          trashCollectedKg: testTrashKg,
          temperature: 24.8,
          dissolvedOxygen: 7.6,
          lat: 25.3176 + (Math.random() - 0.5) * 0.005,
          lng: 83.0062 + (Math.random() - 0.5) * 0.005,
          speedKnots: 3.8,
          signalDbm: -66,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTestResult(`✅ Telemetry Ingested Successfully! Lat: ${data.point.lat.toFixed(4)}, Lng: ${data.point.lng.toFixed(4)}, pH: ${data.point.ph}`);
        if (onTelemetryIngested && data.point) {
          onTelemetryIngested(data.point);
        }
        await fetchDevices();
      } else {
        setTestResult(`❌ Ingest Rejected: ${data.error || 'Unauthorized secret code.'}`);
      }
    } catch (e: any) {
      setTestResult(`❌ Ingest Error: ${e.message}`);
    } finally {
      setTestSending(false);
    }
  };

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-black/80 flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <TrashTrekkerLogo size="sm" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  Robot Hardware & API Connection Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  REST & Secret Key
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect physical sweeper boats, ESP32 probe buoys, and ROS2 vessels via authenticated API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Hardware Mode Toggle */}
            <button
              onClick={() => onToggleLiveHardwareMode(!isLiveHardwareMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all ${
                isLiveHardwareMode
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle between Simulated Telemetry and Real Live Hardware Ingestion"
            >
              <Zap className={`w-3.5 h-3.5 ${isLiveHardwareMode ? 'text-emerald-400 fill-emerald-400 animate-pulse' : ''}`} />
              <span>{isLiveHardwareMode ? 'Live Hardware API Active' : 'Simulation Mode'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('paired')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'paired'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Paired Robots ({devices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pair_new')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'pair_new'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Pair New Device</span>
          </button>

          <button
            onClick={() => setActiveTab('secret_codes')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'secret_codes'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Secret Pairing Codes</span>
          </button>

          <button
            onClick={() => setActiveTab('api_docs')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'api_docs'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>API Code Snippets</span>
          </button>

          <button
            onClick={() => setActiveTab('test_hook')}
            className={`px-4 py-2 text-xs font-bold border-b-2 flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'test_hook'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Send Test Telemetry</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: PAIRED ROBOTS */}
          {activeTab === 'paired' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Active Registered Fleet</h3>
                  <p className="text-xs text-slate-400">
                    Real-time connection status and remote command links for autonomous units
                  </p>
                </div>
                <button
                  onClick={fetchDevices}
                  disabled={loadingDevices}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingDevices ? 'animate-spin' : ''}`} />
                  <span>Refresh Fleet</span>
                </button>
              </div>

              {devices.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-slate-800 text-center text-slate-400 space-y-3">
                  <Cpu className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm">No robot devices currently registered.</p>
                  <button
                    onClick={() => setActiveTab('pair_new')}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Pair Your First Robot
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device) => {
                    const isOnline = device.status === 'ONLINE';
                    return (
                      <div
                        key={device.id}
                        className="rounded-xl bg-slate-950/70 border border-slate-800 p-4.5 space-y-3 hover:border-slate-700 transition-all relative overflow-hidden"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                            }`}>
                              <Radio className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-white">{device.name}</h4>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  isOnline
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}>
                                  {device.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">ID: {device.id} · {device.model}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleUnpair(device.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Disconnect & Unpair Device"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Secret Key Display */}
                        <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
                          <div className="flex items-center gap-2 text-slate-300">
                            <Key className="w-3.5 h-3.5 text-amber-400" />
                            <span className="text-[11px] text-slate-400">Secret:</span>
                            <span className="font-bold text-amber-300">{device.secretKey}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(device.secretKey, device.id)}
                            className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                            title="Copy secret key"
                          >
                            {copiedKey === device.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Stats Metrics */}
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                              <Battery className="w-3 h-3 text-sky-400" />
                              <span>Battery</span>
                            </div>
                            <p className="text-xs font-bold text-sky-300 font-mono mt-0.5">{device.battery}%</p>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                              <Signal className="w-3 h-3 text-emerald-400" />
                              <span>Signal</span>
                            </div>
                            <p className="text-xs font-bold text-emerald-300 font-mono mt-0.5">{device.signalStrengthDbm} dBm</p>
                          </div>

                          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80">
                            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px]">
                              <Cpu className="w-3 h-3 text-purple-400" />
                              <span>Pings</span>
                            </div>
                            <p className="text-xs font-bold text-purple-300 font-mono mt-0.5">{device.totalPings}</p>
                          </div>
                        </div>

                        {/* Remote Command Triggers */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">Commands:</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleSendCommand(device.id, 'START_PATROL')}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 border border-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5" />
                              <span>Patrol</span>
                            </button>
                            <button
                              onClick={() => handleSendCommand(device.id, 'RTL')}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-sky-500/20 text-slate-300 hover:text-sky-300 border border-slate-700 text-[10px] font-semibold transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>RTL (Base)</span>
                            </button>
                            <button
                              onClick={() => handleSendCommand(device.id, 'EMERGENCY_STOP')}
                              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-semibold transition-colors"
                            >
                              Kill Switch
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAIR NEW DEVICE */}
          {activeTab === 'pair_new' && (
            <form onSubmit={handlePairDevice} className="space-y-4 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Pair New Robot or Sensor Unit</h3>
                <p className="text-xs text-slate-400">
                  Register hardware credentials to allow authenticated HTTP POST telemetry into TrashTrekker
                </p>
              </div>

              {pairingStatus && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  pairingStatus.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {pairingStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{pairingStatus.message}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Robot Hardware ID</label>
                  <input
                    type="text"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value.toUpperCase())}
                    placeholder="e.g. BOT-TT-10"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Device Friendly Name</label>
                  <input
                    type="text"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    placeholder="e.g. TrashTrekker MK-IV Secondary"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Hardware Platform</label>
                  <select
                    value={newHardwareType}
                    onChange={(e) => setNewHardwareType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="MARK_IV_SWEEPER">Autonomous Marine Sweeper MK-IV</option>
                    <option value="ESP32_BUOY">ESP32 IoT LoRa Hydro Buoy</option>
                    <option value="ROS2_VESSEL">ROS2 / PX4 Autonomous Boat</option>
                    <option value="LORA_GATEWAY">LoRaWAN Basin Gateway</option>
                    <option value="CUSTOM_API">Custom HTTP/REST Robot (Python/C++)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assigned River Sector</label>
                  <select
                    value={newSectorId}
                    onChange={(e) => setNewSectorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {RIVER_SECTORS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.river})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Secret Key Input with Auto-Generate */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>Secret Pairing Key (Authentication Code)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateNewKey}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isGeneratingKey ? 'animate-spin' : ''}`} />
                    Generate Random Code
                  </button>
                </div>
                <input
                  type="text"
                  value={newSecretKey}
                  onChange={(e) => setNewSecretKey(e.target.value)}
                  placeholder="e.g. TT-SEC-9842-X7"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-500">
                  The robot firmware must supply this secret key in HTTP header <code className="text-slate-400">X-Robot-Secret</code> or payload body.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Authorize & Pair Robot</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SECRET PAIRING CODES */}
          {activeTab === 'secret_codes' && (
            <div className="space-y-5 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Device Secret Pairing Codes</h3>
                <p className="text-xs text-slate-400">
                  Secret authentication keys used by microcontrollers to securely handshake with TrashTrekker API
                </p>
              </div>

              {/* Master Key Card */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Fleet Secret Key</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-mono font-bold text-sm text-amber-300 tracking-wider">
                    {generatedSecret}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(generatedSecret, 'gen-sec')}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                    >
                      {copiedKey === 'gen-sec' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Key</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleGenerateNewKey}
                      disabled={isGeneratingKey}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Generate new key"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGeneratingKey ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Include this secret key in your microcontroller HTTP requests or set as environment variable <code className="text-slate-300">ROBOT_SECRET_KEY</code>.
                </p>
              </div>

              {/* How it works breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span>1. Flash Secret</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Flash the secret code onto your ESP32, Raspberry Pi, or boat telemetry computer.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span>2. HTTP POST</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Robot sends JSON sensor telemetry to <code className="text-slate-300 font-mono">/api/robot/telemetry</code>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-purple-400 font-bold flex items-center gap-1.5">
                    <span>3. Live Sync</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Dashboard live maps, graphs, and emergency AI instantly synchronize with real vessel data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API CODE SNIPPETS */}
          {activeTab === 'api_docs' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-200">Robot Telemetry Integration Snippets</h3>
                  <p className="text-xs text-slate-400">
                    Copy and paste these snippets directly into your robot's firmware or control scripts
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['curl', 'python', 'esp32', 'nodejs'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSnippetLanguage(lang)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all uppercase ${
                        snippetLanguage === lang
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                <div className="px-4 py-2 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-sans">
                    Endpoint: <code className="text-emerald-400 font-mono font-bold">POST {currentHost}/api/robot/telemetry</code>
                  </span>
                  <button
                    onClick={() => {
                      let code = '';
                      if (snippetLanguage === 'curl') {
                        code = `curl -X POST ${currentHost}/api/robot/telemetry \\\n  -H "Content-Type: application/json" \\\n  -H "X-Robot-Secret: ${generatedSecret}" \\\n  -d '{\n    "robotId": "BOT-TT-09",\n    "ph": 7.42,\n    "turbidity": 6.8,\n    "dissolvedOxygen": 7.5,\n    "temperature": 24.5,\n    "battery": 95,\n    "lat": 25.3176,\n    "lng": 83.0062,\n    "trashCollectedKg": 14.2\n  }'`;
                      } else if (snippetLanguage === 'python') {
                        code = `import requests, time\n\nAPI_URL = "${currentHost}/api/robot/telemetry"\nSECRET_KEY = "${generatedSecret}"\n\npayload = {\n    "robotId": "BOT-TT-09",\n    "secretKey": SECRET_KEY,\n    "ph": 7.35,\n    "turbidity": 5.4,\n    "dissolvedOxygen": 7.8,\n    "temperature": 24.1,\n    "battery": 94,\n    "lat": 25.3176,\n    "lng": 83.0062,\n    "trashCollectedKg": 12.5\n}\n\nresponse = requests.post(API_URL, json=payload, headers={"X-Robot-Secret": SECRET_KEY})\nprint("Status:", response.status_code, response.json())`;
                      } else if (snippetLanguage === 'esp32') {
                        code = `// ESP32 WiFi Telemetry Publisher\n#include <WiFi.h>\n#include <HTTPClient.h>\n\nconst char* serverUrl = "${currentHost}/api/robot/telemetry";\nconst char* secretKey = "${generatedSecret}";\n\nvoid sendTelemetry(float ph, float turbidity, float battery, float lat, float lng) {\n  if(WiFi.status() == WL_CONNECTED){\n    HTTPClient http;\n    http.begin(serverUrl);\n    http.addHeader("Content-Type", "application/json");\n    http.addHeader("X-Robot-Secret", secretKey);\n\n    String json = "{\\"robotId\\":\\"BOT-TT-09\\",\\"ph\\":" + String(ph) + \n                  ",\\"turbidity\\":" + String(turbidity) + \n                  ",\\"battery\\":" + String(battery) + \n                  ",\\"lat\\":" + String(lat, 6) + \n                  ",\\"lng\\":" + String(lng, 6) + "}";\n\n    int httpResponseCode = http.POST(json);\n    Serial.println(httpResponseCode);\n    http.end();\n  }\n}`;
                      } else {
                        code = `// Node.js Robot Telemetry Streamer\nimport fetch from 'node-fetch';\n\nconst API_URL = '${currentHost}/api/robot/telemetry';\nconst SECRET_KEY = '${generatedSecret}';\n\nasync function pushTelemetry() {\n  const res = await fetch(API_URL, {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n      'X-Robot-Secret': SECRET_KEY\n    },\n    body: JSON.stringify({\n      robotId: 'BOT-TT-09',\n      ph: 7.40,\n      turbidity: 6.2,\n      dissolvedOxygen: 7.6,\n      battery: 92,\n      lat: 25.3176,\n      lng: 83.0062\n    })\n  });\n  console.log(await res.json());\n}\n\npushTelemetry();`;
                      }
                      handleCopy(code, 'snippet');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    {copiedKey === 'snippet' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-sans">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-72">
                  <pre>
                    {snippetLanguage === 'curl' && `curl -X POST ${currentHost}/api/robot/telemetry \\
  -H "Content-Type: application/json" \\
  -H "X-Robot-Secret: ${generatedSecret}" \\
  -d '{
    "robotId": "BOT-TT-09",
    "ph": 7.42,
    "turbidity": 6.8,
    "dissolvedOxygen": 7.5,
    "temperature": 24.5,
    "battery": 95,
    "lat": 25.3176,
    "lng": 83.0062,
    "trashCollectedKg": 14.2
  }'`}

                    {snippetLanguage === 'python' && `import requests
import time

API_URL = "${currentHost}/api/robot/telemetry"
SECRET_KEY = "${generatedSecret}"

payload = {
    "robotId": "BOT-TT-09",
    "secretKey": SECRET_KEY,
    "ph": 7.35,
    "turbidity": 5.4,
    "dissolvedOxygen": 7.8,
    "temperature": 24.1,
    "battery": 94,
    "lat": 25.3176,
    "lng": 83.0062,
    "trashCollectedKg": 12.5
}

response = requests.post(API_URL, json=payload, headers={"X-Robot-Secret": SECRET_KEY})
print("Response:", response.status_code, response.json())`}

                    {snippetLanguage === 'esp32' && `// ESP32 WiFi Telemetry Publisher
#include <WiFi.h>
#include <HTTPClient.h>

const char* serverUrl = "${currentHost}/api/robot/telemetry";
const char* secretKey = "${generatedSecret}";

void sendTelemetry(float ph, float turbidity, float battery, float lat, float lng) {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Robot-Secret", secretKey);

    String json = "{\\"robotId\\":\\"BOT-TT-09\\",\\"ph\\":" + String(ph) + 
                  ",\\"turbidity\\":" + String(turbidity) + 
                  ",\\"battery\\":" + String(battery) + 
                  ",\\"lat\\":" + String(lat, 6) + 
                  ",\\"lng\\":" + String(lng, 6) + "}";

    int httpResponseCode = http.POST(json);
    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}`}

                    {snippetLanguage === 'nodejs' && `// Node.js Telemetry Ingestion Bridge
import fetch from 'node-fetch';

const API_URL = '${currentHost}/api/robot/telemetry';
const SECRET_KEY = '${generatedSecret}';

async function pushTelemetry() {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Robot-Secret': SECRET_KEY
    },
    body: JSON.stringify({
      robotId: 'BOT-TT-09',
      ph: 7.40,
      turbidity: 6.2,
      dissolvedOxygen: 7.6,
      battery: 92,
      lat: 25.3176,
      lng: 83.0062
    })
  });
  console.log(await res.json());
}

pushTelemetry();`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEND TEST TELEMETRY (SIMULATOR HOOK) */}
          {activeTab === 'test_hook' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Interactive API Telemetry Tester</h3>
                <p className="text-xs text-slate-400">
                  Send a live test HTTP telemetry payload directly to the server to verify device auth & data pipeline
                </p>
              </div>

              {testResult && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200">
                  {testResult}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Target Robot ID</label>
                  <input
                    type="text"
                    value={testRobotId}
                    onChange={(e) => setTestRobotId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Secret Code</label>
                  <input
                    type="text"
                    value={testSecret}
                    onChange={(e) => setTestSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Slider Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Simulated pH Level</span>
                    <span className="font-mono font-bold text-emerald-400">{testPh.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.05"
                    value={testPh}
                    onChange={(e) => setTestPh(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Turbidity (NTU)</span>
                    <span className="font-mono font-bold text-cyan-400">{testTurbidity.toFixed(1)} NTU</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    step="0.5"
                    value={testTurbidity}
                    onChange={(e) => setTestTurbidity(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Robot Battery</span>
                    <span className="font-mono font-bold text-sky-400">{testBattery}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={testBattery}
                    onChange={(e) => setTestBattery(parseInt(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Trash Harvested</span>
                    <span className="font-mono font-bold text-amber-400">{testTrashKg.toFixed(1)} kg</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="0.5"
                    value={testTrashKg}
                    onChange={(e) => setTestTrashKg(parseFloat(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSendTestTelemetry}
                disabled={testSending}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testSending ? 'Transmitting Ingestion Ping...' : 'Transmit Ingested Telemetry to Server'}</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>REST API Listening on <code className="text-slate-200 font-mono font-bold">/api/robot/*</code></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
