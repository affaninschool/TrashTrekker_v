import { FleetRobot, RiverLandmark, RiverSector } from '../types';

export interface ObstacleWarning {
  hasObstacle: boolean;
  type: 'SHORE' | 'ROBOT' | 'LANDMARK';
  name: string;
  distanceMeters: number;
  bearingRelativeDeg: number; // e.g. -20 for Port/Left, +20 for Starboard/Right
  isCritical: boolean; // distance <= 12m
  advisory: string;
  obstacleCoords: [number, number];
}

/**
 * Standard Ray-Casting algorithm to check if a geographic coordinate (lat, lng)
 * is inside a polygon defined by [[lat, lng], ...].
 */
export function isPointInsidePolygon(lat: number, lng: number, polygon: [number, number][]): boolean {
  if (!polygon || polygon.length < 3) return true;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][1], yi = polygon[i][0];
    const xj = polygon[j][1], yj = polygon[j][0];

    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Convert lat/lng delta to approximate distance in meters (around latitude 25.29°).
 */
export function calculateDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat_m = (lat2 - lat1) * 110800;
  const dLng_m = (lng2 - lng1) * 100650;
  return Math.sqrt(dLat_m * dLat_m + dLng_m * dLng_m);
}

/**
 * Calculate distance in meters from a point to a line segment.
 */
function distanceToSegmentMeters(
  lat: number, lng: number,
  latA: number, lngA: number,
  latB: number, lngB: number
): number {
  const x = lng * 100650;
  const y = lat * 110800;
  const xA = lngA * 100650;
  const yA = latA * 110800;
  const xB = lngB * 100650;
  const yB = latB * 110800;

  const dx = xB - xA;
  const dy = yB - yA;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const ddx = x - xA;
    const ddy = y - yA;
    return Math.sqrt(ddx * ddx + ddy * ddy);
  }

  let t = ((x - xA) * dx + (y - yA) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = xA + t * dx;
  const projY = yA + t * dy;
  const diffX = x - projX;
  const diffY = y - projY;

  return Math.sqrt(diffX * diffX + diffY * diffY);
}

/**
 * Minimum distance in meters from (lat, lng) to the nearest edge of the pond polygon.
 */
export function getDistanceToPondShoreMeters(lat: number, lng: number, polygon: [number, number][]): number {
  if (!polygon || polygon.length < 3) return 999;
  let minDistance = 99999;

  for (let i = 0; i < polygon.length; i++) {
    const nextIdx = (i + 1) % polygon.length;
    const segDist = distanceToSegmentMeters(
      lat, lng,
      polygon[i][0], polygon[i][1],
      polygon[nextIdx][0], polygon[nextIdx][1]
    );
    if (segDist < minDistance) {
      minDistance = segDist;
    }
  }

  return minDistance;
}

/**
 * Check if the movement to (candidateLat, candidateLng) is safe inside the pond boundary.
 * Prevents the robot from going out of the lake water boundary!
 */
export function validateLakeContainment(
  candidateLat: number,
  candidateLng: number,
  polygon: [number, number][],
  minShoreBufferMeters: number = 6
): { allowed: boolean; reason?: string; shoreDistanceMeters: number } {
  if (!polygon || polygon.length < 3) {
    return { allowed: true, shoreDistanceMeters: 50 };
  }

  const isInside = isPointInsidePolygon(candidateLat, candidateLng, polygon);
  const shoreDist = getDistanceToPondShoreMeters(candidateLat, candidateLng, polygon);

  if (!isInside) {
    return {
      allowed: false,
      reason: 'Boundary limit exceeded: Target position is outside Tapan Dighi perimeter.',
      shoreDistanceMeters: 0,
    };
  }

  if (shoreDist < minShoreBufferMeters) {
    return {
      allowed: false,
      reason: `Shore proximity barrier: Robot within ${shoreDist.toFixed(1)}m of shore. Thrusters locked to prevent grounding.`,
      shoreDistanceMeters: shoreDist,
    };
  }

  return { allowed: true, shoreDistanceMeters: shoreDist };
}

/**
 * Detects if an obstacle (shoreline, other robot, or fixed landmark) is present
 * in front of the controlled robot's current heading.
 */
export function detectObstaclesAhead(
  robot: FleetRobot,
  allRobots: FleetRobot[],
  sector: RiverSector,
  maxDetectDistanceMeters: number = 55
): ObstacleWarning | null {
  if (!robot) return null;

  const currentHeading = robot.heading ?? 0;
  const rad = (currentHeading * Math.PI) / 180;
  const obstacles: ObstacleWarning[] = [];

  const polygon = sector.pondPolygon || sector.waypoints;

  // 1. Check forward shoreline intersection along the heading trajectory
  if (polygon && polygon.length >= 3) {
    // Sample along the heading vector every 4 meters up to maxDetectDistanceMeters
    for (let dist = 4; dist <= maxDetectDistanceMeters; dist += 3) {
      const sampleLat = robot.lat + (Math.cos(rad) * dist) / 110800;
      const sampleLng = robot.lng + (Math.sin(rad) * dist) / 100650;

      const inside = isPointInsidePolygon(sampleLat, sampleLng, polygon);
      const shoreDist = getDistanceToPondShoreMeters(sampleLat, sampleLng, polygon);

      if (!inside || shoreDist < 5) {
        const isCrit = dist <= 14;
        obstacles.push({
          hasObstacle: true,
          type: 'SHORE',
          name: 'Tapan Dighi Shoreline Boundary',
          distanceMeters: Math.round(dist),
          bearingRelativeDeg: 0,
          isCritical: isCrit,
          advisory: isCrit
            ? 'CRITICAL: Shoreline directly ahead! Reverse thrusters or turn 90°.'
            : 'Caution: Approaching shore. Recommend steering Port or Starboard.',
          obstacleCoords: [sampleLat, sampleLng],
        });
        break;
      }
    }
  }

  // 2. Check other fleet vessels
  allRobots.forEach((other) => {
    if (other.id === robot.id) return;

    const dLat_m = (other.lat - robot.lat) * 110800;
    const dLng_m = (other.lng - robot.lng) * 100650;
    const dist = Math.sqrt(dLat_m * dLat_m + dLng_m * dLng_m);

    if (dist <= maxDetectDistanceMeters) {
      // Calculate bearing from robot to other
      const bearingDeg = (Math.atan2(dLng_m, dLat_m) * 180 / Math.PI + 360) % 360;
      // Relative angle between -180 and +180
      const relAngle = ((bearingDeg - currentHeading + 540) % 360) - 180;

      // In front cone of ±50 degrees
      if (Math.abs(relAngle) <= 50) {
        const isCrit = dist <= 14;
        const turnDir = relAngle >= 0 ? 'Port (Left)' : 'Starboard (Right)';
        obstacles.push({
          hasObstacle: true,
          type: 'ROBOT',
          name: `${other.callsign} (${other.name.split('(')[1]?.replace(')', '') || other.role})`,
          distanceMeters: Math.round(dist),
          bearingRelativeDeg: Math.round(relAngle),
          isCritical: isCrit,
          advisory: isCrit
            ? `COLLISION ALERT: Vessel directly ahead at ${Math.round(dist)}m! Steer ${turnDir}.`
            : `Traffic Warning: Active vessel ahead. Yield or steer ${turnDir}.`,
          obstacleCoords: [other.lat, other.lng],
        });
      }
    }
  });

  // 3. Check fixed lake landmarks (buoys, weirs, piers, sanctuaries)
  if (sector.landmarks && sector.landmarks.length > 0) {
    sector.landmarks.forEach((landmark) => {
      const dLat_m = (landmark.coords[0] - robot.lat) * 110800;
      const dLng_m = (landmark.coords[1] - robot.lng) * 100650;
      const dist = Math.sqrt(dLat_m * dLat_m + dLng_m * dLng_m);

      if (dist <= maxDetectDistanceMeters) {
        const bearingDeg = (Math.atan2(dLng_m, dLat_m) * 180 / Math.PI + 360) % 360;
        const relAngle = ((bearingDeg - currentHeading + 540) % 360) - 180;

        if (Math.abs(relAngle) <= 50) {
          const isCrit = dist <= 14;
          const turnDir = relAngle >= 0 ? 'Port (Left)' : 'Starboard (Right)';
          obstacles.push({
            hasObstacle: true,
            type: 'LANDMARK',
            name: landmark.name,
            distanceMeters: Math.round(dist),
            bearingRelativeDeg: Math.round(relAngle),
            isCritical: isCrit,
            advisory: isCrit
              ? `PROXIMITY WARNING: Fixed structure ahead at ${Math.round(dist)}m! Steer ${turnDir}.`
              : `Navigational mark ahead (${landmark.name.split('(')[0].trim()}). Maintain clearance.`,
            obstacleCoords: landmark.coords,
          });
        }
      }
    });
  }

  if (obstacles.length === 0) return null;

  // Sort by distance (closest first)
  obstacles.sort((a, b) => a.distanceMeters - b.distanceMeters);
  return obstacles[0];
}
