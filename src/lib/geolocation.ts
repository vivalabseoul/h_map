import { Geolocation } from '@capacitor/geolocation';

export interface Coordinates {
  lat: number;
  lng: number;
}

// @capacitor/geolocation wraps the standard W3C Geolocation API on web and
// the native OS location APIs on Android — same call site for both platforms.
export async function requestUserLocation(): Promise<Coordinates> {
  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy: true,
    timeout: 10000,
  });
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}
