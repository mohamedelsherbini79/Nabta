export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface LocationTrigger extends GeoPoint {
  radiusM: number;
  label?: string;
}

const EARTH_RADIUS_M = 6371000;

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function distanceMeters(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function isWithinTrigger(current: GeoPoint, trigger: LocationTrigger): boolean {
  return distanceMeters(current, trigger) <= trigger.radiusM;
}
