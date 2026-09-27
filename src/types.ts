export type ThemeMode = 'dark' | 'light';
export type ColorTheme = 'amber-gold' | 'cyber-ocean' | 'emerald-bio' | 'solar-amber' | 'ultraviolet';

export type DashboardTab = 'overview' | 'map' | 'telemetry' | 'fleet';

export interface AlertConfig {
  criticalAcidPh: number;      // default 6.00
  warningAcidPh: number;       // default 6.50
  warningAlkalinePh: number;   // default 8.20
  criticalAlkalinePh: number;  // default 9.00
  criticalTurbidity: number;   // default 30.0 NTU
  minDissolvedOxygen: number;  // default 5.0 mg/L
  criticalH2s: number;         // default 0.08 ppm (toxic gas)
  warningH2s: number;          // default 0.02 ppm
  criticalMethane: number;     // default 3.0 % LEL
  warningMethane: number;      // default 1.0 % LEL
  criticalBod: number;         // default 8.0 mg/L
  criticalPhosphate: number;   // default 0.40 mg/L
  emailNotifications: {
    critical: boolean;
    warning: boolean;
    dailyDigest: boolean;
    recipientEmail: string;
  };
  smsNotifications: {
    critical: boolean;
    warning: boolean;
    recipientPhone: string;
  };
  autoDispatchAuthorities: boolean;
  dispatchAgency: string;
}

export interface TelemetryPoint {
  id: string;
  timestamp: string;
  timeNumber: number;
  lat: number;
  lng: number;
  locationName?: string;
  nearestLandmark?: string;
  ph: number;
  temperature: number;
  humidity: number;
  aqi: number; // Water Quality Index (0-100, higher is better)
  turbidity: number; // NTU
  dissolvedOxygen: number; // mg/L
  bodLevel: number; // Biochemical Oxygen Demand (mg/L, organic load)
  h2sLevel: number; // Hydrogen Sulfide (ppm, water toxicity & safety)
  methaneLevel: number; // Methane Gas (% LEL, environmental impact)
  phosphateLevel: number; // Phosphate (mg/L, nutrient eutrophication)
  trashCollectedKg: number;
  instantTrashAddedKg?: number;
  speedKnots: number;
  battery: number;
  solarWatts: number;
  isSpike: boolean;
  status: 'safe' | 'warning' | 'critical';
  heading: number; // Degrees 0-360
  flowRate: number; // m3/s
}

export interface AlertLog {
  id: string;
  timestamp: string;
  timeIso: string;
  lat: number;
  lng: number;
  ph: number;
  temperature: number;
  turbidity: number;
  bodLevel?: number;
  h2sLevel?: number;
  methaneLevel?: number;
  phosphateLevel?: number;
  severity: 'CRITICAL' | 'WARNING';
  title: string;
  description: string;
  notified: boolean;
  notifiedAt?: string;
  agency?: string;
  resolved: boolean;
  zone: string;
}

export interface RiverLandmark {
  id: string;
  name: string;
  hindiName?: string;
  coords: [number, number];
  type: 'GHAT' | 'CPCB_STATION' | 'CONFLUENCE' | 'BRIDGE' | 'TEMPLE' | 'FORT';
  description: string;
}

export interface RiverSector {
  id: string;
  name: string;
  river: string;
  country: string;
  startPoint: [number, number];
  waypoints: [number, number][];
  pondPolygon?: [number, number][];
  isClosedPond?: boolean;
  landmarks?: RiverLandmark[];
  defaultZoom: number;
  description: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: 'admin' | 'operator' | 'analyst';
}

export interface GroundingSource {
  title?: string;
  url?: string;
  type?: 'search' | 'maps' | 'web';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  groundingSources?: GroundingSource[];
  isPending?: boolean;
}

export interface SavedIncidentReport {
  id: string;
  sectorId: string;
  sectorName: string;
  lat: number;
  lng: number;
  ph: number;
  turbidity: number;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  agency?: string;
  status: 'OPEN' | 'DISPATCHED' | 'RESOLVED';
  createdBy?: string;
  createdByEmail?: string;
  createdAt: string;
}

export interface RobotDevice {
  id: string;
  name: string;
  model: string;
  secretKey: string;
  status: 'ONLINE' | 'STANDBY' | 'OFFLINE' | 'MISSION_ACTIVE';
  lastPing: string;
  ipAddress?: string;
  battery: number;
  signalStrengthDbm: number;
  firmwareVersion: string;
  hardwareType: 'ESP32_BUOY' | 'MARK_IV_SWEEPER' | 'ROS2_VESSEL' | 'LORA_GATEWAY' | 'CUSTOM_API';
  assignedSectorId?: string;
  totalPings?: number;
}

export interface RobotCommand {
  id: string;
  robotId: string;
  commandType: 'RTL' | 'START_PATROL' | 'PAUSE_SWEEP' | 'COLLECT_SAMPLE' | 'EMERGENCY_STOP' | 'SET_WAYPOINT';
  params?: any;
  issuedAt: string;
  status: 'PENDING' | 'EXECUTED' | 'FAILED';
}

export interface FleetRobot {
  id: string; // 'TT-01', 'TT-02', 'TT-03', 'TT-04', 'TT-05', 'TT-06'
  name: string;
  callsign: string;
  locationName?: string;
  nearestLandmark?: string;
  role: 'PRIMARY_SWEEPER' | 'BIO_SKIMMER' | 'DEBRIS_INTERCEPTOR' | 'PLUME_ANALYZER' | 'STANDBY_PATROL' | 'MICROPLASTIC_SKIMMER';
  status: 'ACTIVE_CLEANING' | 'PATROLLING' | 'TRASH_HARVESTING' | 'WATER_SAMPLING' | 'STANDBY_PATROL';
  progressOffset: number;
  speedMultiplier: number;
  battery: number;
  trashCollectedKg: number;
  trashCapacityKg: number;
  solarWatts: number;
  speedKnots: number;
  heading: number;
  lat: number;
  lng: number;
  color: string;
  isPrimary?: boolean;
  isManual?: boolean;
  directionMode?: 'AUTO' | 'MANUAL';
}

export interface MissionStats {
  totalTrashKg: number;
  distanceTraveledKm: number;
  uptimeSeconds: number;
  criticalAlertCount: number;
  cleanSamplesCount: number;
  avgPh: number;
  avgTemp: number;
  botStatus: 'ONLINE' | 'PAUSED' | 'RETURNING' | 'DOCKING';
}
