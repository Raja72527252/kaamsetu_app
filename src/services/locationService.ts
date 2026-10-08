import * as Location from 'expo-location';
import { Location as AppLocation } from '../types';

export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Location permission error:', error);
    return false;
  }
}

export async function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const isGranted = await requestLocationPermission();
    if (!isGranted) return null;
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.warn('GPS retrieval error:', error);
    return null;
  }
}

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<Partial<AppLocation> | null> {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const geo = results[0];
      return {
        state: geo.region || 'Bihar',
        district: geo.district || geo.subregion || 'Katihar',
        city: geo.city || geo.subregion || 'Katihar',
        area: geo.name || geo.street || 'Main Road',
        pinCode: geo.postalCode || '854105',
        latitude,
        longitude,
      };
    }
    return null;
  } catch (error) {
    console.warn('Reverse geocoding error:', error);
    return null;
  }
}
