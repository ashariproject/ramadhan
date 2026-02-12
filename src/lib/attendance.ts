import { MASJID_COORDINATES } from './constants';

type SessionType = 'subuh' | 'kegiatan_harian' | 'tarawih' | null;

/**
 * Calculates distance between two coordinates in meters using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
}

/**
 * Checks if the user is within the allowed radius of the Masjid
 */
export function isWithinGeofence(userLat: number, userLon: number): boolean {
    // TEMPORARY BYPASS: Always return true for testing purposes as requested.
    // Console log the distance for debugging
    const distance = calculateDistance(
        userLat,
        userLon,
        MASJID_COORDINATES.latitude,
        MASJID_COORDINATES.longitude
    );
    console.log(`[DEBUG] Distance to Masjid: ${distance.toFixed(2)}m`);

    return true; // <--- BYPASSED for "GPS saat ini sementara"
}

/**
 * Determines the current active Ramadhan session based on time of day
 */
export function getCurrentSession(): SessionType {
    const now = new Date();
    const hour = now.getHours();

    // TEMPORARY: Relaxed windows for testing
    // Subuh: 04:00 - 07:00 (Extended)
    if (hour >= 4 && hour < 7) return 'subuh';

    // Kegiatan Harian: 15:00 - 18:30 (Extended)
    if (hour >= 15 && hour < 19) return 'kegiatan_harian';

    // Tarawih: 19:00 - 23:00 (Extended)
    if (hour >= 19 && hour < 23) return 'tarawih';

    return null;
}
