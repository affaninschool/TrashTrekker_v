import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  BarChart3,
  Bell,
  Bot,
  CheckCircle,
  Clock,
  Compass,
  Cpu,
  Download,
  Droplets,
  FileDown,
  FileText,
  Flame,
  Globe,
  Info,
  Key,
  Layers,
  LayoutDashboard,
  MapPin,
  Menu,
  Moon,
  Palette,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Send,
  Shield,
  ShieldAlert,
  Sliders,
  Sparkles,
  Sun,
  Terminal,
  Thermometer,
  Trash2,
  Waves,
  Wifi,
  Wind,
  X,
  Zap
} from 'lucide-react';
import { AlertConfig, AlertLog, ColorTheme, DashboardTab, FleetRobot, RiverSector, TelemetryPoint, ThemeMode } from './types';
import { validateLakeContainment, detectObstaclesAhead } from './utils/navigation';
import {
  calculateFleetPositions,
  DEFAULT_ALERT_CONFIG,
  generateInitialTelemetryHistory,
  INITIAL_FLEET_ROBOTS,
  RIVER_SECTORS,
  simulateNextTelemetryStep
} from './utils/simulation';
import { exportMonthlyReportPDF, exportTelemetryToCSV } from './utils/export';
import { Sidebar } from './components/Sidebar';
import { OverviewView } from './components/views/OverviewView';
import { LiveMapView } from './components/views/LiveMapView';
import { SensorTelemetryView } from './components/views/SensorTelemetryView';
import { FleetManagementView } from './components/views/FleetManagementView';
import { AuthorityModal } from './components/AuthorityModal';
import { AlertConfigModal } from './components/AlertConfigModal';
import { DevicePairingModal } from './components/DevicePairingModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { TrashTrekkerLogo } from './components/TrashTrekkerLogo';
import {
  useFirebaseAuth,
  saveUserAlertConfigToFirestore,
  loadUserAlertConfigFromFirestore,
  logIncidentToFirestore
} from './lib/firestoreService';

export default function App() {
  const [selectedSector, setSelectedSector] = useState<RiverSector>(RIVER_SECTORS[0]);
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Initial mission state
  const initialData = generateInitialTelemetryHistory(RIVER_SECTORS[0], 20);
  const [history, setHistory] = useState<TelemetryPoint[]>(initialData.history);
  const [alerts, setAlerts] = useState<AlertLog[]>(initialData.alerts);
  const [totalTrashKg, setTotalTrashKg] = useState<number>(initialData.totalTrash);
  const [recentTrashGained, setRecentTrashGained] = useState<number>(0);

  // Multi-Robot Closed Pond Fleet state
  const initialFleet = calculateFleetPositions(RIVER_SECTORS[0].waypoints, 20, INITIAL_FLEET_ROBOTS, RIVER_SECTORS[0]);
  const [fleetRobots, setFleetRobots] = useState<FleetRobot[]>(initialFleet);
  const [selectedRobotId, setSelectedRobotId] = useState<string>('TT-01');

  // Robot Hardware & Device Pairing Modal
  const [isDevicePairingOpen, setIsDevicePairingOpen] = useState<boolean>(false);
  const [isLiveHardwareMode, setIsLiveHardwareMode] = useState<boolean>(false);
  const [activeRobotsCount, setActiveRobotsCount] = useState<number>(5);

  // Monthly Analytical Report Modal
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState<boolean>(false);

  // Color Palette theme state
  const [colorTheme, setColorTheme] = useState<ColorTheme>('amber-gold');
  const [isPalettePickerOpen, setIsPalettePickerOpen] = useState<boolean>(false);

  // Alert configuration state (custom pH limits & notification opt-ins)
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(DEFAULT_ALERT_CONFIG);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);

  // Firebase Auth hook
  const { user, signingIn, loginWithGoogle, logout } = useFirebaseAuth();

  // UI Theme state (Light / Dark mode)
  const [theme, setTheme] = useState<ThemeMode>('dark');

  // Simulation controls
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(342);
  const [stepCounter, setStepCounter] = useState<number>(20);

  // Pending spike queue
  const [forceSpikeNext, setForceSpikeNext] = useState<boolean>(false);

  // Map & highlight state
  const [highlightedCoords, setHighlightedCoords] = useState<[number, number] | null>(null);

  // Authority notification modal
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<AlertLog | null>(null);
  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState<boolean>(false);

  // Flash alert banner for new critical incidents
  const [activeIncidentBanner, setActiveIncidentBanner] = useState<AlertLog | null>(null);

  // Manual navigation and safety alert state (lake boundary & obstacle proximity)
  const [navigationAlert, setNavigationAlert] = useState<{
    message: string;
    type: 'WARNING' | 'CRITICAL';
    timestamp: number;
  } | null>(null);

  useEffect(() => {
    if (!navigationAlert) return;
    const t = setTimeout(() => setNavigationAlert(null), 5000);
    return () => clearTimeout(t);
  }, [navigationAlert]);

  // Refs for stable simulation execution
  const historyRef = useRef<TelemetryPoint[]>(history);
  historyRef.current = history;
  const forceSpikeRef = useRef<boolean>(forceSpikeNext);
  forceSpikeRef.current = forceSpikeNext;
  const sectorRef = useRef<RiverSector>(selectedSector);
  sectorRef.current = selectedSector;
  const stepCounterRef = useRef<number>(stepCounter);
  stepCounterRef.current = stepCounter;
  const alertConfigRef = useRef<AlertConfig>(alertConfig);
  alertConfigRef.current = alertConfig;
  const fleetRobotsRef = useRef<FleetRobot[]>(fleetRobots);
  fleetRobotsRef.current = fleetRobots;

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light-theme');
    } else {
      root.classList.add('dark');
      root.classList.remove('light-theme');
    }
  }, [theme]);

  // Load custom user config from Firestore upon sign-in
  useEffect(() => {
    if (!user?.uid) return;
    loadUserAlertConfigFromFirestore(user.uid).then((savedConfig) => {
      if (savedConfig) {
        setAlertConfig(savedConfig);
      }
    });
  }, [user?.uid]);

  // Current point is the most recent in history
  const currentPoint = history[history.length - 1] || initialData.history[initialData.history.length - 1];
  const previousPoint = history[history.length - 2] || currentPoint;

  // Timer for uptime
  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Main Simulation Loop
  useEffect(() => {
    if (!isRunning || isLiveHardwareMode) return;

    const intervalMs = Math.max(600, 3000 / speed);
    const timer = setInterval(() => {
      const prevHistory = historyRef.current;
      const last = prevHistory[prevHistory.length - 1];
      if (!last) return;

      const nextStep = stepCounterRef.current + 1;
      setStepCounter(nextStep);

      const shouldSpike = forceSpikeRef.current;
      if (shouldSpike) {
        setForceSpikeNext(false);
      }

      const activeSector = sectorRef.current;
      const currentConfig = alertConfigRef.current;
      const { newPoint, newAlert } = simulateNextTelemetryStep(
        last,
        activeSector,
        nextStep,
        shouldSpike,
        currentConfig
      );

      // Add recent trash gain
      const trashIncrement = nextStep % 4 === 0 ? 0.4 : 0;
      if (trashIncrement > 0) {
        setTotalTrashKg((prev) => +(prev + trashIncrement).toFixed(2));
        setRecentTrashGained(trashIncrement);
        setTimeout(() => setRecentTrashGained(0), 1800);
      }

      // Update multi-robot positions across the closed pond (preserves manual steering)
      setFleetRobots(calculateFleetPositions(activeSector.waypoints, nextStep, fleetRobotsRef.current, activeSector));

      // Append next telemetry point
      setHistory((prev) => {
        const next = [...prev, newPoint];
        return next.length > 60 ? next.slice(-60) : next;
      });

      // If alert triggered
      if (newAlert) {
        setAlerts((prev) => [newAlert, ...prev]);
        if (newAlert.severity === 'CRITICAL') {
          setActiveIncidentBanner(newAlert);
        }
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speed, isLiveHardwareMode]);

  // Handle direct manual test telemetry ingestion
  const handleDirectTelemetryIngested = (ingestedPoint: any) => {
    const pt: TelemetryPoint = {
      id: ingestedPoint.id || `direct-${Date.now()}`,
      timestamp: ingestedPoint.timestamp || new Date().toLocaleTimeString(),
      timeNumber: ingestedPoint.timeNumber || Date.now(),
      lat: ingestedPoint.lat,
      lng: ingestedPoint.lng,
      ph: ingestedPoint.ph,
      temperature: ingestedPoint.temperature || 24.5,
      humidity: ingestedPoint.humidity || 62,
      bodLevel: ingestedPoint.bodLevel ?? 2.4,
      h2sLevel: ingestedPoint.h2sLevel ?? 0.008,
      methaneLevel: ingestedPoint.methaneLevel ?? 0.45,
      phosphateLevel: ingestedPoint.phosphateLevel ?? 0.09,
      aqi: ingestedPoint.aqi || 85,
      turbidity: ingestedPoint.turbidity,
      dissolvedOxygen: ingestedPoint.dissolvedOxygen || 7.5,
      trashCollectedKg: ingestedPoint.trashCollectedKg || totalTrashKg,
      instantTrashAddedKg: ingestedPoint.instantTrashAddedKg || 0,
      speedKnots: ingestedPoint.speedKnots || 3.4,
      battery: ingestedPoint.battery || 95,
      solarWatts: 140,
      isSpike: ingestedPoint.isSpike || false,
      status: ingestedPoint.status || 'safe',
      heading: ingestedPoint.heading || 180,
      flowRate: 4.2,
    };

    setHistory((prev) => {
      const next = [...prev, pt];
      return next.length > 60 ? next.slice(-60) : next;
    });
  };

  // Reset Mission
  const handleResetMission = () => {
    const freshData = generateInitialTelemetryHistory(selectedSector, 20);
    setHistory(freshData.history);
    setAlerts(freshData.alerts);
    setTotalTrashKg(freshData.totalTrash);
    setFleetRobots(calculateFleetPositions(selectedSector.waypoints, 20, INITIAL_FLEET_ROBOTS, selectedSector));
    setStepCounter(20);
    setUptimeSeconds(0);
    setForceSpikeNext(false);
    setActiveIncidentBanner(null);
  };

  // Direct manual directional steering and rudder control for autonomous fleet robots
  const handleControlRobotDirection = (
    robotId: string,
    action: 'forward' | 'reverse' | 'turn_left' | 'turn_right' | 'set_heading' | 'toggle_mode' | 'set_speed' | 'stop',
    value?: any
  ) => {
    setFleetRobots((prev) =>
      prev.map((r) => {
        if (r.id !== robotId) return r;
        const currentHeading = r.heading ?? 0;
        const currentSpeed = r.speedKnots ?? 2.5;

        if (action === 'toggle_mode') {
          const newMode = r.directionMode === 'MANUAL' ? 'AUTO' : 'MANUAL';
          return { ...r, directionMode: newMode, isManual: newMode === 'MANUAL' };
        }

        if (action === 'turn_left') {
          const delta = typeof value === 'number' ? value : 15;
          const nextHeading = (currentHeading - delta + 360) % 360;
          return { ...r, heading: nextHeading, directionMode: 'MANUAL', isManual: true };
        }

        if (action === 'turn_right') {
          const delta = typeof value === 'number' ? value : 15;
          const nextHeading = (currentHeading + delta) % 360;
          return { ...r, heading: nextHeading, directionMode: 'MANUAL', isManual: true };
        }

        if (action === 'set_heading') {
          const heading = typeof value === 'number' ? (value + 360) % 360 : currentHeading;
          return { ...r, heading, directionMode: 'MANUAL', isManual: true };
        }

        if (action === 'forward') {
          const rad = (currentHeading * Math.PI) / 180;
          const step = 0.00035; // responsive direct nudge
          const candidateLat = r.lat + Math.cos(rad) * step;
          const candidateLng = r.lng + Math.sin(rad) * step;

          const polygon = selectedSector.pondPolygon || selectedSector.waypoints;
          const containment = validateLakeContainment(candidateLat, candidateLng, polygon, 5.5);

          if (!containment.allowed) {
            setNavigationAlert({
              message: containment.reason || 'Tapan Dighi boundary limit reached! Robot containment lock prevented crossing shore.',
              type: 'WARNING',
              timestamp: Date.now(),
            });
            return {
              ...r,
              speedKnots: 0,
              directionMode: 'MANUAL',
              isManual: true,
            };
          }

          // Check if an obstacle or vessel is directly ahead (< 6m)
          const obstacleAhead = detectObstaclesAhead(r, prev, selectedSector, 25);
          if (obstacleAhead && obstacleAhead.distanceMeters <= 6) {
            setNavigationAlert({
              message: `Collision lock engaged: ${obstacleAhead.name} is ${obstacleAhead.distanceMeters}m directly ahead! Steer or reverse to bypass.`,
              type: 'CRITICAL',
              timestamp: Date.now(),
            });
            return {
              ...r,
              speedKnots: 0,
              directionMode: 'MANUAL',
              isManual: true,
            };
          }

          return {
            ...r,
            lat: candidateLat,
            lng: candidateLng,
            directionMode: 'MANUAL',
            isManual: true,
            speedKnots: Math.max(2.0, currentSpeed || 2.5),
          };
        }

        if (action === 'reverse') {
          const rad = (currentHeading * Math.PI) / 180;
          const step = 0.00035;
          const candidateLat = r.lat - Math.cos(rad) * step;
          const candidateLng = r.lng - Math.sin(rad) * step;

          const polygon = selectedSector.pondPolygon || selectedSector.waypoints;
          const containment = validateLakeContainment(candidateLat, candidateLng, polygon, 5.5);

          if (!containment.allowed) {
            setNavigationAlert({
              message: 'Reverse boundary barrier reached! Robot kept safely in Tapan Dighi water.',
              type: 'WARNING',
              timestamp: Date.now(),
            });
            return {
              ...r,
              speedKnots: 0,
              directionMode: 'MANUAL',
              isManual: true,
            };
          }

          return {
            ...r,
            lat: candidateLat,
            lng: candidateLng,
            directionMode: 'MANUAL',
            isManual: true,
          };
        }

        if (action === 'stop') {
          return { ...r, speedKnots: 0, directionMode: 'MANUAL', isManual: true };
        }

        if (action === 'set_speed') {
          return { ...r, speedKnots: typeof value === 'number' ? value : 2.5 };
        }

        return r;
      })
    );
  };

  // Manually trigger a chemical pH spike
  const handleTriggerSpike = () => {
    setForceSpikeNext(true);
  };

  // Authority Notification workflow
  const handleOpenNotifyModal = (alert: AlertLog) => {
    setSelectedAlertForModal(alert);
    setIsAuthorityModalOpen(true);
  };

  const handleConfirmNotify = (alertId: string, agency: string) => {
    const nowStr = new Date().toTimeString().split(' ')[0];
    const targetAlert = alerts.find((a) => a.id === alertId);
    if (targetAlert) {
      logIncidentToFirestore({
        sectorId: selectedSector.id,
        sectorName: selectedSector.name,
        lat: targetAlert.lat,
        lng: targetAlert.lng,
        ph: targetAlert.ph,
        turbidity: targetAlert.turbidity,
        severity: targetAlert.severity,
        title: targetAlert.title,
        description: targetAlert.description,
        agency,
        status: 'DISPATCHED',
        createdBy: user?.uid || 'autonomous-agent',
        createdByEmail: user?.email || 'operator@trashtrekker.eco',
      });
    }

    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              notified: true,
              notifiedAt: `${nowStr} (Dispatched)`,
              agency,
            }
          : a
      )
    );
    if (activeIncidentBanner && activeIncidentBanner.id === alertId) {
      setActiveIncidentBanner(null);
    }
  };

  const handleLocateOnMap = (coords: [number, number]) => {
    setHighlightedCoords(coords);
    setCurrentTab('map');
  };

  const handleExportData = () => {
    exportTelemetryToCSV(history, alerts);
  };

  const handleExportPDF = () => {
    exportMonthlyReportPDF(history, alerts, selectedSector, totalTrashKg);
  };

  const pendingAlertsCount = alerts.filter((a) => !a.notified).length;
  const isLight = theme === 'light';

  return (
    <div
      className={`min-h-screen flex flex-row transition-colors duration-200 ${
        isLight
          ? 'bg-slate-50 text-slate-900 selection:bg-cyan-500/20'
          : 'bg-[#030712] text-slate-100 selection:bg-cyan-500/30'
      }`}
    >
      {/* 1. Left Desktop Sidebar Navigation */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          totalTrashKg={totalTrashKg}
          recentTrashGained={recentTrashGained}
          currentPoint={currentPoint}
          activeRobotsCount={activeRobotsCount}
          isLiveHardwareMode={isLiveHardwareMode}
          pendingAlertsCount={pendingAlertsCount}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          colorTheme={colorTheme}
          user={user}
          onLogin={loginWithGoogle}
          signingIn={signingIn}
          onLogout={logout}
          onOpenDevicePairing={() => setIsDevicePairingOpen(true)}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          onOpenReportModal={() => setIsMonthlyReportOpen(true)}
          onTriggerSpike={handleTriggerSpike}
          selectedSector={selectedSector}
          uptimeSeconds={uptimeSeconds}
        />
      </div>

      {/* 2. Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex h-full">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              collapsed={false}
              onToggleCollapse={() => setMobileMenuOpen(false)}
              totalTrashKg={totalTrashKg}
              recentTrashGained={recentTrashGained}
              currentPoint={currentPoint}
              activeRobotsCount={activeRobotsCount}
              isLiveHardwareMode={isLiveHardwareMode}
              pendingAlertsCount={pendingAlertsCount}
              theme={theme}
              onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              colorTheme={colorTheme}
              user={user}
              onLogin={loginWithGoogle}
              signingIn={signingIn}
              onLogout={logout}
              onOpenDevicePairing={() => {
                setIsDevicePairingOpen(true);
                setMobileMenuOpen(false);
              }}
              onOpenConfigModal={() => {
                setIsConfigModalOpen(true);
                setMobileMenuOpen(false);
              }}
              onOpenReportModal={() => {
                setIsMonthlyReportOpen(true);
                setMobileMenuOpen(false);
              }}
              onTriggerSpike={() => {
                handleTriggerSpike();
                setMobileMenuOpen(false);
              }}
              selectedSector={selectedSector}
              uptimeSeconds={uptimeSeconds}
            />
          </div>
        </div>
      )}

      {/* 3. Main Dashboard Workspace Layout */}
      <div className={`flex-1 flex flex-col min-w-0 h-screen overflow-y-auto scrollbar-thin theme-${colorTheme}`}>
        
        {/* Top Floating Glassmorphic App Bar */}
        <header
          className={`sticky top-0 z-30 px-4 sm:px-8 py-3.5 border-b backdrop-blur-2xl flex items-center justify-between gap-4 transition-colors ${
            colorTheme === 'amber-gold'
              ? 'border-amber-700/40 bg-slate-950/90 shadow-lg shadow-amber-950/20'
              : colorTheme === 'cyber-ocean'
              ? 'border-cyan-800/40 bg-slate-950/90 shadow-lg shadow-cyan-950/20'
              : colorTheme === 'emerald-bio'
              ? 'border-emerald-800/40 bg-slate-950/90 shadow-lg shadow-emerald-950/20'
              : colorTheme === 'solar-amber'
              ? 'border-yellow-700/40 bg-slate-950/90 shadow-lg shadow-yellow-950/20'
              : 'border-violet-800/40 bg-slate-950/90 shadow-lg shadow-violet-950/20'
          }`}
        >
          
          {/* Left: Mobile Menu Toggle & Active View Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  colorTheme === 'amber-gold'
                    ? 'text-amber-400'
                    : colorTheme === 'cyber-ocean'
                    ? 'text-cyan-400'
                    : colorTheme === 'emerald-bio'
                    ? 'text-emerald-400'
                    : colorTheme === 'solar-amber'
                    ? 'text-yellow-400'
                    : 'text-violet-400'
                }`}
              >
                TrashTrekker
              </span>
              <span className="text-slate-600 font-mono">/</span>
              <span className="text-sm font-bold text-white tracking-tight capitalize">
                {currentTab === 'overview'
                  ? 'Mission Overview'
                  : currentTab === 'map'
                  ? 'Live Lake Map (5 Vessels)'
                  : currentTab === 'telemetry'
                  ? 'Hydrochemical Telemetry'
                  : 'Swarm Fleet Management'}
              </span>
              <span className="hidden xl:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                Tapan Dighi Eco Lake
              </span>
            </div>
          </div>

          {/* Right: Simulation Controls & Theme Palette Picker */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Color Palette Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPalettePickerOpen(!isPalettePickerOpen)}
                title="Change UI Color Theme"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  colorTheme === 'amber-gold'
                    ? 'bg-amber-950/50 text-amber-300 border-amber-500/50'
                    : colorTheme === 'cyber-ocean'
                    ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/50'
                    : colorTheme === 'emerald-bio'
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50'
                    : colorTheme === 'solar-amber'
                    ? 'bg-yellow-950/50 text-yellow-300 border-yellow-500/50'
                    : 'bg-violet-950/50 text-violet-300 border-violet-500/50'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span className="hidden md:inline capitalize">
                  {colorTheme === 'amber-gold' ? 'Amber Gold' : colorTheme.replace('-', ' ')}
                </span>
              </button>

              {isPalettePickerOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl p-2 z-50 backdrop-blur-xl space-y-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    Select UI Color Palette
                  </div>
                  <button
                    onClick={() => {
                      setColorTheme('amber-gold');
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono transition-all ${
                      colorTheme === 'amber-gold'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
                    <span>Amber Gold</span>
                  </button>
                  <button
                    onClick={() => {
                      setColorTheme('cyber-ocean');
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono transition-all ${
                      colorTheme === 'cyber-ocean'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                    <span>Cyber Ocean</span>
                  </button>
                  <button
                    onClick={() => {
                      setColorTheme('emerald-bio');
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono transition-all ${
                      colorTheme === 'emerald-bio'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                    <span>Emerald Matrix</span>
                  </button>
                  <button
                    onClick={() => {
                      setColorTheme('solar-amber');
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono transition-all ${
                      colorTheme === 'solar-amber'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
                    <span>Solar Amber</span>
                  </button>
                  <button
                    onClick={() => {
                      setColorTheme('ultraviolet');
                      setIsPalettePickerOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-mono transition-all ${
                      colorTheme === 'ultraviolet'
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50" />
                    <span>Ultraviolet</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Simulation Engine Controls (Play/Pause & Speed) */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800/90 rounded-2xl p-1 shadow-lg backdrop-blur-md">
              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isRunning
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                }`}
                title={isRunning ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}
              >
                {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span className="hidden sm:inline">{isRunning ? 'Running' : 'Paused'}</span>
              </button>

              <button
                onClick={() => setSpeed(speed === 1 ? 2 : speed === 2 ? 4 : 1)}
                className="px-2.5 py-1.5 rounded-xl text-[11px] font-mono font-bold text-yellow-300 hover:bg-slate-800 transition-colors"
                title="Cycle simulation polling speed"
              >
                {speed}x
              </button>

              <button
                onClick={handleResetMission}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Reset simulation history"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Export PDF */}
            <button
              onClick={handleExportPDF}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-violet-950/70 to-purple-950/70 hover:from-violet-900 hover:to-purple-900 text-white text-xs font-semibold border border-violet-500/40 shadow-md transition-all active:scale-95"
              title="Export WBPCB Compliance PDF Summary"
            >
              <FileDown className="w-3.5 h-3.5 text-yellow-300" />
              <span>Report PDF</span>
            </button>
          </div>

        </header>

        {/* Dynamic Critical Incident Banner (Hazard detected) */}
        {activeIncidentBanner && !activeIncidentBanner.notified && (
          <div className="mx-4 sm:mx-8 mt-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500/80 p-4 shadow-2xl shadow-rose-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-rose-500 text-white font-bold shadow-lg shrink-0 animate-bounce">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500 text-white">
                    Emergency Alert
                  </span>
                  <span className="text-xs text-rose-300 font-mono">
                    {activeIncidentBanner.timestamp}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {activeIncidentBanner.title}: pH at {activeIncidentBanner.ph.toFixed(2)}
                </h2>
                <p className="text-xs text-slate-300 font-mono">
                  Coordinates: [{activeIncidentBanner.lat.toFixed(5)}, {activeIncidentBanner.lng.toFixed(5)}] • Tapan Dighi Eco Lake
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleLocateOnMap([activeIncidentBanner.lat, activeIncidentBanner.lng])}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inspect on Map</span>
              </button>

              <button
                onClick={() => handleOpenNotifyModal(activeIncidentBanner)}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-lg shadow-rose-950/60 uppercase tracking-wider transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Notify WBPCB</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Display Area with Generous Padding & Dark Space */}
        <main className="p-4 sm:p-8 space-y-8 flex-1">
          {currentTab === 'overview' && (
            <OverviewView
              currentPoint={currentPoint}
              history={history}
              totalTrashKg={totalTrashKg}
              recentTrashGained={recentTrashGained}
              selectedSector={selectedSector}
              fleetRobots={fleetRobots}
              selectedRobotId={selectedRobotId}
              onSelectRobot={setSelectedRobotId}
              onNavigateTab={setCurrentTab}
              onOpenReportModal={() => setIsMonthlyReportOpen(true)}
              onTriggerSpike={handleTriggerSpike}
            />
          )}

          {currentTab === 'map' && (
            <LiveMapView
              history={history}
              currentPoint={currentPoint}
              selectedSector={selectedSector}
              fleetRobots={fleetRobots}
              selectedRobotId={selectedRobotId}
              onSelectRobot={setSelectedRobotId}
              highlightedCoords={highlightedCoords}
              onControlRobot={handleControlRobotDirection}
              navigationAlert={navigationAlert}
            />
          )}

          {currentTab === 'telemetry' && (
            <SensorTelemetryView
              currentPoint={currentPoint}
              history={history}
              onTriggerSpike={handleTriggerSpike}
              onOpenConfigModal={() => setIsConfigModalOpen(true)}
            />
          )}

          {currentTab === 'fleet' && (
            <FleetManagementView
              fleetRobots={fleetRobots}
              selectedRobotId={selectedRobotId}
              onSelectRobot={setSelectedRobotId}
              selectedSector={selectedSector}
              currentPoint={currentPoint}
              onOpenDevicePairing={() => setIsDevicePairingOpen(true)}
            />
          )}
        </main>

        {/* Modern Minimalist Footer */}
        <footer className="border-t border-slate-900 px-6 py-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Trash-Trekker Autonomous Eco-Swarm (5 Vessels Online)</span>
          </div>
          <div className="flex items-center gap-4">
            <span>WBPCB & CPCB Telemetry Relay</span>
            <span>•</span>
            <span>LoRa 915MHz Mesh</span>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <AuthorityModal
        alert={selectedAlertForModal}
        isOpen={isAuthorityModalOpen}
        onClose={() => setIsAuthorityModalOpen(false)}
        onConfirmNotify={handleConfirmNotify}
      />

      <AlertConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        config={alertConfig}
        onSaveConfig={(newConfig) => {
          setAlertConfig(newConfig);
          if (user?.uid) {
            saveUserAlertConfigToFirestore(user.uid, newConfig, theme, selectedSector.id);
          }
        }}
        onTriggerTestSpike={handleTriggerSpike}
      />

      <DevicePairingModal
        isOpen={isDevicePairingOpen}
        onClose={() => setIsDevicePairingOpen(false)}
        isLiveHardwareMode={isLiveHardwareMode}
        onToggleLiveHardwareMode={(enabled) => setIsLiveHardwareMode(enabled)}
        onTelemetryIngested={handleDirectTelemetryIngested}
      />

      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
        history={history}
        alerts={alerts}
        selectedSector={selectedSector}
        totalTrashKg={totalTrashKg}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportData}
      />

    </div>
  );
}
