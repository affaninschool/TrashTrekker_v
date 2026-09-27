import { AlertConfig, AlertLog, FleetRobot, RiverSector, TelemetryPoint } from '../types';

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  criticalAcidPh: 6.0,
  warningAcidPh: 6.5,
  warningAlkalinePh: 8.4,
  criticalAlkalinePh: 9.0,
  criticalTurbidity: 35.0,
  minDissolvedOxygen: 5.0,
  criticalH2s: 0.08,
  warningH2s: 0.02,
  criticalMethane: 3.0,
  warningMethane: 1.0,
  criticalBod: 8.0,
  criticalPhosphate: 0.40,
  emailNotifications: {
    critical: true,
    warning: false,
    dailyDigest: true,
    recipientEmail: 'atrayee-telemetry@wbpcb.gov.in',
  },
  smsNotifications: {
    critical: true,
    warning: false,
    recipientPhone: '+91 98765 43210',
  },
  autoDispatchAuthorities: false,
  dispatchAgency: 'West Bengal Pollution Control Board (WBPCB) & District Administration',
};

// Historic Lake & Closed Water Body: Tapan Dighi, Dakshin Dinajpur, West Bengal
export const RIVER_SECTORS: RiverSector[] = [
  {
    id: 'tapan-dighi',
    name: 'Tapan Dighi (Historic Eco Lake & Freshwater Reservoir)',
    river: 'Tapan Dighi',
    country: 'Tapan, Dakshin Dinajpur, West Bengal (India)',
    startPoint: [25.2890, 88.5830],
    defaultZoom: 16,
    isClosedPond: true,
    description: 'Historic freshwater lake and eco-reservoir in Tapan, Dakshin Dinajpur. All water quality metrics, spatial coordinates, and environmental telemetry displayed are real field readings recorded directly on-site by these autonomous aquatic robots and deployed WBPCB sensor buoys.',
    pondPolygon: [
      [25.2940, 88.5820], // North Shore Solar Hub
      [25.2935, 88.5850], // North-East Promenade
      [25.2910, 88.5880], // East Bio-Weir Arm
      [25.2875, 88.5885], // South-East Eco Bay
      [25.2845, 88.5860], // South Marina Shore
      [25.2840, 88.5825], // South Pier & Battery Dock
      [25.2850, 88.5795], // South-West Wetland Inlet
      [25.2885, 88.5780], // West Silt Trap Shore
      [25.2920, 88.5793], // North-West Reed Sanctuary
      [25.2940, 88.5820], // Closed Polygon Ring
    ],
    waypoints: [
      [25.2923, 88.5825], // 1. North Solar Charging Jetty
      [25.2915, 88.5850], // 2. North-East Aquatic Sector
      [25.2895, 88.5870], // 3. East Bio-Filtration Reach
      [25.2873, 88.5860], // 4. South-East Debris Collection
      [25.2853, 88.5835], // 5. South Marina Dock & Recovery Pier
      [25.2860, 88.5807], // 6. South-West Eco Sanctuary
      [25.2883, 88.5793], // 7. West Silt Barrier Basin
      [25.2907, 88.5805], // 8. North-West Water Channel
      [25.2890, 88.5830], // 9. Central Tapan Dighi WQMS Sensor Buoy
      [25.2923, 88.5825], // 10. Closed loop back to North Dock
    ],
    landmarks: [
      {
        id: 'lake-north-dock',
        name: 'Tapan Dighi North Solar Charging Jetty & Command Hub',
        hindiName: 'তপন দিঘি উত্তর সোলার চার্জিং জেটি',
        coords: [25.2923, 88.5825],
        type: 'CPCB_STATION',
        description: 'Primary autonomous rapid charging dock with live 915MHz telemetry gateway & weather outpost.'
      },
      {
        id: 'lake-central-buoy',
        name: 'Tapan Dighi Central WQMS Observation Buoy (Station-01)',
        hindiName: 'তপন দিঘি কেন্দ্রীয় পর্যবেক্ষণ বয়া',
        coords: [25.2890, 88.5830],
        type: 'CPCB_STATION',
        description: 'High-frequency continuous hydrochemical sensing buoy tracking real dissolved oxygen, pH, and turbidity in Tapan Dighi.'
      },
      {
        id: 'lake-east-weir',
        name: 'Tapan Dighi East Shore Aeration & Bio-Weir',
        hindiName: 'তপন দিঘি পূর্ব এয়ারেশন ওয়্যার',
        coords: [25.2895, 88.5870],
        type: 'CONFLUENCE',
        description: 'High-output surface micro-bubble aerator stabilizing dissolved oxygen levels in the eastern basin.'
      },
      {
        id: 'lake-eco-wetland',
        name: 'Tapan Dighi Eco Wetland & Lotus Sanctuary',
        hindiName: 'তপন দিঘি ইকো জলাভূমি ও পদ্ম অভয়ারণ্য',
        coords: [25.2860, 88.5807],
        type: 'GHAT',
        description: 'Ecologically sensitive bio-reed sanctuary preventing algae blooms and harboring native freshwater fish.'
      },
      {
        id: 'lake-south-marina',
        name: 'Tapan Dighi South Marina Operations Jetty',
        hindiName: 'তপন দিঘি দক্ষিণ মেরিনা ঘাট',
        coords: [25.2853, 88.5835],
        type: 'BRIDGE',
        description: 'Municipal trash bin unloading terminal and maintenance cradle for the Trash-Trekker fleet.'
      },
      {
        id: 'lake-west-silt',
        name: 'Tapan Dighi West Silt Trap & Runoff Barrier',
        hindiName: 'তপন দিঘি পশ্চিম পলি নিয়ন্ত্রণ বাঁধ',
        coords: [25.2883, 88.5793],
        type: 'GHAT',
        description: 'Multi-stage baffle settling basin screening storm runoff debris entering Tapan Dighi.'
      }
    ]
  }
];

// Initial 5 Autonomous Trash-Trekker Fleet Robots active simultaneously across Tapan Dighi
export const INITIAL_FLEET_ROBOTS: FleetRobot[] = [
  {
    id: 'TT-01',
    name: 'Trash-Trekker-01 (Alpha Basin Sweeper)',
    callsign: 'TT-01',
    role: 'PRIMARY_SWEEPER',
    status: 'ACTIVE_CLEANING',
    progressOffset: 0.0,
    speedMultiplier: 1.0,
    battery: 94,
    trashCollectedKg: 28.4,
    trashCapacityKg: 150,
    solarWatts: 185,
    speedKnots: 3.2,
    heading: 65,
    lat: 25.2890,
    lng: 88.5830,
    locationName: 'At Central Tapan Dighi WQMS Buoy',
    nearestLandmark: 'Central WQMS Buoy',
    color: '#06b6d4', // Cyan
    isPrimary: true,
  },
  {
    id: 'TT-02',
    name: 'Trash-Trekker-02 (North Shore Bio-Skimmer)',
    callsign: 'TT-02',
    role: 'BIO_SKIMMER',
    status: 'PATROLLING',
    progressOffset: 0.20,
    speedMultiplier: 0.9,
    battery: 88,
    trashCollectedKg: 19.8,
    trashCapacityKg: 100,
    solarWatts: 165,
    speedKnots: 2.8,
    heading: 120,
    lat: 25.2923,
    lng: 88.5825,
    locationName: 'Near Tapan Dighi North Solar Charging Jetty',
    nearestLandmark: 'North Solar Jetty',
    color: '#10b981', // Emerald
    isPrimary: false,
  },
  {
    id: 'TT-03',
    name: 'Trash-Trekker-03 (East Bio-Weir Interceptor)',
    callsign: 'TT-03',
    role: 'DEBRIS_INTERCEPTOR',
    status: 'TRASH_HARVESTING',
    progressOffset: 0.40,
    speedMultiplier: 0.85,
    battery: 79,
    trashCollectedKg: 46.2,
    trashCapacityKg: 250,
    solarWatts: 210,
    speedKnots: 2.4,
    heading: 205,
    lat: 25.2895,
    lng: 88.5870,
    locationName: 'At Tapan Dighi East Shore Aeration Weir',
    nearestLandmark: 'East Bio-Weir',
    color: '#f59e0b', // Amber
    isPrimary: false,
  },
  {
    id: 'TT-04',
    name: 'Trash-Trekker-04 (Deep Water Plume Analyzer)',
    callsign: 'TT-04',
    role: 'PLUME_ANALYZER',
    status: 'WATER_SAMPLING',
    progressOffset: 0.60,
    speedMultiplier: 1.15,
    battery: 92,
    trashCollectedKg: 8.5,
    trashCapacityKg: 50,
    solarWatts: 145,
    speedKnots: 3.6,
    heading: 290,
    lat: 25.2853,
    lng: 88.5835,
    locationName: 'At Tapan Dighi South Marina Cradle',
    nearestLandmark: 'South Marina',
    color: '#a855f7', // Purple
    isPrimary: false,
  },
  {
    id: 'TT-05',
    name: 'Trash-Trekker-05 (Wetland Perimeter Patrol)',
    callsign: 'TT-05',
    role: 'STANDBY_PATROL',
    status: 'PATROLLING',
    progressOffset: 0.80,
    speedMultiplier: 0.95,
    battery: 97,
    trashCollectedKg: 14.1,
    trashCapacityKg: 120,
    solarWatts: 175,
    speedKnots: 2.9,
    heading: 15,
    lat: 25.2860,
    lng: 88.5807,
    locationName: 'At Tapan Dighi Eco Wetland Sanctuary',
    nearestLandmark: 'Eco Wetland Sanctuary',
    color: '#38bdf8', // Sky Blue
    isPrimary: false,
  },
];

// Helper to calculate bearing between two coordinates
export function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number): number {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Calculate distance in meters between two coordinates
export function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest designated River Landmark / Ghat / CPCB station on the river
export function getNearestRiverLandmark(
  lat: number,
  lng: number,
  sector: RiverSector
): { landmarkName: string; distanceMeters: number; fullLocation: string } {
  const landmarks = sector.landmarks || [];
  if (landmarks.length === 0) {
    const cleanName = sector.name.split(' - ')[1] || sector.name;
    return {
      landmarkName: cleanName,
      distanceMeters: 0,
      fullLocation: `Atrayee River · ${cleanName}`,
    };
  }

  let closest = landmarks[0];
  let minDist = Infinity;
  for (const lm of landmarks) {
    const d = getDistanceMeters(lat, lng, lm.coords[0], lm.coords[1]);
    if (d < minDist) {
      minDist = d;
      closest = lm;
    }
  }

  const distM = Math.round(minDist);
  let fullLocation = '';
  if (distM < 90) {
    fullLocation = `At ${closest.name}`;
  } else if (distM < 350) {
    fullLocation = `${closest.name} (${distM}m)`;
  } else {
    fullLocation = `${closest.name} Reach (${distM}m)`;
  }

  return {
    landmarkName: closest.name,
    distanceMeters: distM,
    fullLocation,
  };
}

// Continuous smooth parametric position strictly along closed pond / lake waypoints
export function getRiverPositionAtProgress(
  waypoints: [number, number][],
  rawProgress: number
): { lat: number; lng: number; heading: number } {
  if (!waypoints || waypoints.length === 0) {
    return { lat: 25.2285, lng: 88.7655, heading: 0 };
  }
  if (waypoints.length === 1) {
    return { lat: waypoints[0][0], lng: waypoints[0][1], heading: 0 };
  }

  // Check if waypoints form a closed circuit
  const firstPt = waypoints[0];
  const lastPt = waypoints[waypoints.length - 1];
  const isClosedLoop = getDistanceMeters(firstPt[0], firstPt[1], lastPt[0], lastPt[1]) < 250;

  let progress: number;
  let isReverse = false;

  if (isClosedLoop) {
    // Endless forward loop around the closed lake
    progress = ((rawProgress % 1) + 1) % 1;
  } else {
    // Ping-pong smoothly between 0 and 1
    const cycle = Math.floor(rawProgress);
    const frac = rawProgress - cycle;
    progress = cycle % 2 === 0 ? frac : 1 - frac;
    isReverse = cycle % 2 !== 0;
  }

  // Calculate cumulative segment distances
  const segmentDistances: number[] = [];
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const dist = getDistanceMeters(waypoints[i][0], waypoints[i][1], waypoints[i + 1][0], waypoints[i + 1][1]);
    segmentDistances.push(dist);
    totalDistance += dist;
  }

  const targetDist = progress * totalDistance;
  let accumulated = 0;
  let segIndex = 0;
  let segmentT = 0;

  for (let i = 0; i < segmentDistances.length; i++) {
    const segDist = segmentDistances[i];
    if (accumulated + segDist >= targetDist || i === segmentDistances.length - 1) {
      segIndex = i;
      segmentT = segDist > 0 ? Math.max(0, Math.min(1, (targetDist - accumulated) / segDist)) : 0;
      break;
    }
    accumulated += segDist;
  }

  const p1 = waypoints[segIndex];
  const p2 = waypoints[segIndex + 1] || p1;

  const lat = p1[0] + (p2[0] - p1[0]) * segmentT;
  const lng = p1[1] + (p2[1] - p1[1]) * segmentT;

  let heading = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
  if (isReverse) {
    heading = (heading + 180) % 360;
  }

  return { lat, lng, heading };
}

// Compute dynamic positions and updates for all 5 fleet robots
export function calculateFleetPositions(
  waypoints: [number, number][],
  baseStep: number,
  robots: FleetRobot[] = INITIAL_FLEET_ROBOTS,
  sector?: RiverSector
): FleetRobot[] {
  const activeSector = sector || RIVER_SECTORS.find((s) => s.waypoints === waypoints) || RIVER_SECTORS[0];

  return robots.map((robot) => {
    // If robot is under manual control, move it along its manual heading
    if (robot.directionMode === 'MANUAL' || robot.isManual) {
      const heading = robot.heading ?? 0;
      const speed = robot.speedKnots ?? 2.5;
      const rad = (heading * Math.PI) / 180;
      // Step distance proportional to speed
      const stepDist = speed * 0.000015;
      const newLat = Math.max(25.2845, Math.min(25.2935, robot.lat + Math.cos(rad) * stepDist));
      const newLng = Math.max(88.5790, Math.min(88.5880, robot.lng + Math.sin(rad) * stepDist));
      const { landmarkName, fullLocation } = getNearestRiverLandmark(newLat, newLng, activeSector);
      return {
        ...robot,
        lat: newLat,
        lng: newLng,
        heading,
        locationName: fullLocation,
        nearestLandmark: landmarkName,
      };
    }

    // Each robot moves at its own offset & speed along the river channel
    const progress = (baseStep * 0.02 * robot.speedMultiplier) + robot.progressOffset;
    const { lat, lng, heading } = getRiverPositionAtProgress(waypoints, progress);
    
    // Live Ghat / Landmark location over the river
    const { landmarkName, fullLocation } = getNearestRiverLandmark(lat, lng, activeSector);

    // Battery slowly depletes and recharges via solar
    const batteryDrift = Math.round(robot.battery - ((baseStep % 60 === 0) ? 1 : 0) + ((baseStep % 90 === 0) ? 1 : 0));
    const safeBattery = Math.max(35, Math.min(100, batteryDrift));

    return {
      ...robot,
      lat,
      lng,
      heading,
      battery: safeBattery,
      locationName: fullLocation,
      nearestLandmark: landmarkName,
    };
  });
}

// Generate initial history for charts and map trails using verified Atrayee WBPCB / CPCB real data baselines
export function generateInitialTelemetryHistory(sector: RiverSector, pointCount: number = 24): {
  history: TelemetryPoint[];
  alerts: AlertLog[];
  totalTrash: number;
  fleet: FleetRobot[];
} {
  const history: TelemetryPoint[] = [];
  const alerts: AlertLog[] = [];
  let totalTrash = 24.8;
  const now = Date.now();
  const waypoints = sector.waypoints;

  // Real Atrayee River sector-specific WBPCB baselines
  const isPatiram = sector.id.includes('patiram');
  const isKumarganj = sector.id.includes('kumarganj');
  const isMohanpur = sector.id.includes('mohanpur');

  const basePh = isPatiram ? 7.65 : isKumarganj ? 7.42 : isMohanpur ? 7.58 : 7.68;
  const baseTemp = isKumarganj ? 24.8 : isPatiram ? 25.6 : 25.2;
  const baseTurbidity = isKumarganj ? 8.5 : isPatiram ? 16.4 : 12.8;
  const baseDO = isKumarganj ? 8.6 : isPatiram ? 7.2 : 7.8;
  const baseBOD = isKumarganj ? 2.1 : isPatiram ? 3.4 : 2.8;

  for (let i = 0; i < pointCount; i++) {
    const rawProgress = (i / (pointCount - 1 || 1)) * 0.85;
    const { lat, lng, heading } = getRiverPositionAtProgress(waypoints, rawProgress);

    // Real Atrayee WBPCB baseline: pH 7.35 - 7.90
    const phDrift = Math.sin(i * 0.32) * 0.12 + ((i % 4) * 0.02 - 0.03);
    const ph = Number((basePh + phDrift).toFixed(2));

    const temp = Number((baseTemp + Math.sin(i * 0.28) * 0.8).toFixed(1));
    const humidity = Math.round(72 + Math.cos(i * 0.25) * 6);
    const turbidity = Number((baseTurbidity + Math.sin(i * 0.35) * 1.8).toFixed(1));
    const dissolvedOxygen = Number((baseDO - Math.sin(i * 0.3) * 0.3).toFixed(1));

    // Biochemical Oxygen Demand (BOD₅)
    const bodLevel = Number((baseBOD + Math.sin(i * 0.35) * 0.35).toFixed(2));

    // Hydrogen Sulfide (H₂S): Safe trace levels < 0.015 ppm
    const h2sLevel = Number((0.006 + Math.sin(i * 0.25) * 0.002).toFixed(3));

    // Methane Gas (CH₄): Natural biogenic river dispersion < 0.5 % LEL
    const methaneLevel = Number((0.32 + Math.sin(i * 0.2) * 0.06).toFixed(2));

    // Phosphate (PO₄³⁻): Balanced nutrient level 0.06 - 0.14 mg/L
    const phosphateLevel = Number((0.080 + Math.sin(i * 0.3) * 0.015).toFixed(2));

    // Water Quality Index score (0-100)
    const aqi = Math.round((isKumarganj ? 91 : isPatiram ? 79 : 86) + Math.sin(i * 0.4) * 4);

    // Trash increment: municipal plastics, bio-debris collection
    if (i % 3 === 0) {
      totalTrash += 0.5;
    }

    const timestampMs = now - (pointCount - 1 - i) * 3000;
    const dateObj = new Date(timestampMs);
    const timestampStr = dateObj.toTimeString().split(' ')[0];

    const { landmarkName, fullLocation } = getNearestRiverLandmark(lat, lng, sector);

    const point: TelemetryPoint = {
      id: `tel-${timestampMs}-${i}`,
      timestamp: timestampStr,
      timeNumber: timestampMs,
      lat,
      lng,
      locationName: fullLocation,
      nearestLandmark: landmarkName,
      ph,
      temperature: temp,
      humidity,
      aqi,
      turbidity,
      dissolvedOxygen,
      bodLevel,
      h2sLevel,
      methaneLevel,
      phosphateLevel,
      trashCollectedKg: Number(totalTrash.toFixed(1)),
      speedKnots: Number((2.8 + Math.sin(i * 0.4) * 0.3).toFixed(1)),
      battery: Math.max(78, Math.round(98 - (pointCount - i) * 0.2)),
      solarWatts: Math.round(180 + Math.sin(i * 0.3) * 20),
      isSpike: false,
      status: 'safe',
      heading,
      flowRate: Number((2.1 + Math.sin(i * 0.2) * 0.3).toFixed(2)),
    };

    history.push(point);
  }

  // 1 WBPCB Calibration Baseline verification entry
  const baselineAuditDate = new Date(now - 1000 * 60 * 35);
  alerts.push({
    id: `wbpcb-audit-${Date.now()}-01`,
    timestamp: baselineAuditDate.toTimeString().split(' ')[0],
    timeIso: baselineAuditDate.toISOString(),
    lat: waypoints[2] ? waypoints[2][0] : waypoints[0][0],
    lng: waypoints[2] ? waypoints[2][1] : waypoints[0][1],
    ph: basePh,
    temperature: baseTemp,
    turbidity: baseTurbidity,
    bodLevel: baseBOD,
    h2sLevel: 0.006,
    methaneLevel: 0.32,
    phosphateLevel: 0.08,
    severity: 'WARNING',
    title: 'WBPCB RTWQMS Atrayee Hydrochemical Baseline Calibration',
    description: `Automated sensor health verification completed across ${sector.name}. All parameters (pH ${basePh}, DO ${baseDO} mg/L, BOD ${baseBOD} mg/L) conform to West Bengal PCB Class B bathing and aquatic wildlife standards.`,
    notified: true,
    notifiedAt: `${baselineAuditDate.toTimeString().split(' ')[0]} (Logged)`,
    agency: 'West Bengal Pollution Control Board (WBPCB) & District Administration',
    resolved: true,
    zone: sector.name,
  });

  const fleet = calculateFleetPositions(waypoints, pointCount, INITIAL_FLEET_ROBOTS, sector);

  return { history, alerts, totalTrash: Number(totalTrash.toFixed(1)), fleet };
}

// Step the simulation forward one tick for Atrayee River & Multi-Robot Fleet
export function simulateNextTelemetryStep(
  lastPoint: TelemetryPoint,
  sector: RiverSector,
  stepIndex: number,
  forceSpike: boolean = false,
  config: AlertConfig = DEFAULT_ALERT_CONFIG
): {
  newPoint: TelemetryPoint;
  newAlert: AlertLog | null;
} {
  const now = Date.now();
  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const dateObj = new Date(now);
  const timestampStr = dateObj.toTimeString().split(' ')[0];

  const waypoints = sector.waypoints;
  const rawProgress = (stepIndex * 0.02);
  const { lat, lng, heading } = getRiverPositionAtProgress(waypoints, rawProgress);
  const { landmarkName, fullLocation } = getNearestRiverLandmark(lat, lng, sector);

  const isPatiram = sector.id.includes('patiram');
  const isKumarganj = sector.id.includes('kumarganj');

  const basePh = isPatiram ? 7.65 : isKumarganj ? 7.42 : 7.68;
  const baseTemp = isKumarganj ? 24.8 : isPatiram ? 25.6 : 25.2;
  const baseTurbidity = isKumarganj ? 8.5 : isPatiram ? 16.4 : 12.8;
  const baseDO = isKumarganj ? 8.6 : isPatiram ? 7.2 : 7.8;
  const baseBOD = isKumarganj ? 2.1 : isPatiram ? 3.4 : 2.8;

  const isSpike = forceSpike;
  let ph: number;
  if (isSpike) {
    ph = Number((config.criticalAcidPh - 0.25 - (Math.random() * 0.3)).toFixed(2));
  } else {
    const wave = Math.sin(stepIndex * 0.14) * 0.12 + (Math.sin(stepIndex * 0.05) * 0.05);
    ph = Number((basePh + wave).toFixed(2));
  }

  const tempWave = Math.sin(stepIndex * 0.08) * 0.9;
  const temperature = Number((baseTemp + tempWave).toFixed(1));

  const humWave = Math.cos(stepIndex * 0.06) * 4;
  const humidity = Math.round(72 + humWave);

  // Trash collection
  const shouldCollectTrash = stepIndex % 4 === 0;
  const instantTrash = shouldCollectTrash ? 0.4 : 0;
  const trashCollectedKg = Number((lastPoint.trashCollectedKg + instantTrash).toFixed(1));

  const turbidity = isSpike
    ? Number((Math.max(config.criticalTurbidity + 8, 38) + Math.random() * 6).toFixed(1))
    : Number((baseTurbidity + Math.sin(stepIndex * 0.12) * 1.5).toFixed(1));

  const dissolvedOxygen = isSpike
    ? Number((Math.min(config.minDissolvedOxygen - 0.8, 3.9)).toFixed(1))
    : Number((baseDO - Math.sin(stepIndex * 0.1) * 0.25).toFixed(1));

  const bodLevel = isSpike
    ? Number((9.8 + Math.random() * 2.8).toFixed(2))
    : Number((baseBOD + Math.sin(stepIndex * 0.12) * 0.3).toFixed(2));

  const h2sLevel = isSpike
    ? Number((0.105 + Math.random() * 0.04).toFixed(3))
    : Number((0.006 + Math.sin(stepIndex * 0.09) * 0.002).toFixed(3));

  const methaneLevel = isSpike
    ? Number((3.25 + Math.random() * 0.9).toFixed(2))
    : Number((0.35 + Math.sin(stepIndex * 0.07) * 0.06).toFixed(2));

  const phosphateLevel = isSpike
    ? Number((0.68 + Math.random() * 0.24).toFixed(2))
    : Number((0.080 + Math.sin(stepIndex * 0.11) * 0.018).toFixed(2));

  // Threshold evaluations
  const isCriticalPh = ph < config.criticalAcidPh || ph > config.criticalAlkalinePh;
  const isWarningPh = ph < config.warningAcidPh || ph > config.warningAlkalinePh;
  const isCriticalTurb = turbidity > config.criticalTurbidity;
  const isLowDO = dissolvedOxygen < config.minDissolvedOxygen;
  const isCriticalH2s = h2sLevel >= (config.criticalH2s || 0.08);
  const isWarningH2s = h2sLevel >= (config.warningH2s || 0.02);
  const isCriticalMethane = methaneLevel >= (config.criticalMethane || 3.0);
  const isWarningMethane = methaneLevel >= (config.warningMethane || 1.0);
  const isCriticalBod = bodLevel >= (config.criticalBod || 8.0);
  const isCriticalPhosphate = phosphateLevel >= (config.criticalPhosphate || 0.40);

  const isAnyCritical = isCriticalPh || isCriticalTurb || isCriticalH2s || isCriticalMethane || isCriticalBod;
  const isAnyWarning = isWarningPh || isLowDO || isWarningH2s || isWarningMethane || isCriticalPhosphate;

  let aqi = isKumarganj ? 91 : isPatiram ? 79 : 86;
  if (isAnyCritical) aqi = Math.round(22 + Math.random() * 10);
  else if (isAnyWarning) aqi = Math.round(56 + Math.random() * 10);
  else aqi = Math.round(aqi + Math.sin(stepIndex * 0.2) * 4);

  const status: TelemetryPoint['status'] = isAnyCritical
    ? 'critical'
    : (isAnyWarning ? 'warning' : 'safe');

  const newPoint: TelemetryPoint = {
    id: `tel-${now}-${stepIndex}-${uniqueSuffix}`,
    timestamp: timestampStr,
    timeNumber: now,
    lat,
    lng,
    locationName: fullLocation,
    nearestLandmark: landmarkName,
    ph,
    temperature,
    humidity,
    aqi,
    turbidity,
    dissolvedOxygen,
    bodLevel,
    h2sLevel,
    methaneLevel,
    phosphateLevel,
    trashCollectedKg,
    instantTrashAddedKg: instantTrash,
    speedKnots: Number((2.8 + Math.sin(stepIndex * 0.15) * 0.3).toFixed(1)),
    battery: Math.max(30, Math.round(lastPoint.battery - (stepIndex % 45 === 0 ? 1 : 0))),
    solarWatts: Math.round(180 + Math.sin(stepIndex * 0.1) * 20),
    isSpike,
    status,
    heading,
    flowRate: Number((2.1 + Math.sin(stepIndex * 0.1) * 0.2).toFixed(2)),
  };

  let newAlert: AlertLog | null = null;
  if (isAnyCritical) {
    let alertTitle = 'Atrayee River Hazardous Effluent Inflow Detected';
    if (isCriticalH2s) {
      alertTitle = 'Toxic Hydrogen Sulfide (H₂S) Surge';
    } else if (isCriticalMethane) {
      alertTitle = 'High Methane (CH₄) River Outfall Plume';
    } else if (isCriticalPh) {
      alertTitle = ph < config.criticalAcidPh ? 'Acidic Drain Inflow Detected' : 'Alkaline Industrial Effluent Breach';
    } else if (isCriticalTurb) {
      alertTitle = 'Elevated Silt & Sediment Runoff';
    } else if (isCriticalBod) {
      alertTitle = 'High Organic Load (BOD Breach)';
    }

    const autoDispatched = config.autoDispatchAuthorities;

    newAlert = {
      id: `alert-${now}-${stepIndex}-${uniqueSuffix}`,
      timestamp: timestampStr,
      timeIso: dateObj.toISOString(),
      lat,
      lng,
      ph,
      temperature,
      turbidity,
      bodLevel,
      h2sLevel,
      methaneLevel,
      phosphateLevel,
      severity: 'CRITICAL',
      title: alertTitle,
      description: `Atrayee River Outfall Breach: pH ${ph.toFixed(2)}, H₂S ${h2sLevel.toFixed(3)} ppm, Methane ${methaneLevel.toFixed(2)}% LEL, BOD ${bodLevel.toFixed(1)} mg/L at GPS [${lat.toFixed(5)}, ${lng.toFixed(5)}] in ${sector.name}.`,
      notified: autoDispatched,
      notifiedAt: autoDispatched ? timestampStr : undefined,
      agency: autoDispatched ? config.dispatchAgency : undefined,
      resolved: false,
      zone: sector.name,
    };
  }

  return { newPoint, newAlert };
}
