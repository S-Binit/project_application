import Constants from 'expo-constants';

// Single source of truth: set API_URL in app.json → expo.extra.API_URL
// Should be base API path like: "http://<YOUR-IP>:5000/api"
const configuredUrl = Constants?.expoConfig?.extra?.API_URL;

// API_URL is the base, e.g., http://192.168.18.16:5000/api
export const API_BASE = configuredUrl || 'http://localhost:5000/api';
export const AUTH_URL = `${API_BASE}/auth`;
export const LOCATION_URL = `${API_BASE}/location`;
export const API_URL = AUTH_URL; // Keep for backwards compatibility

if (__DEV__) {
  console.log('[API] Using API_BASE:', API_BASE);
  console.log('[API] Using AUTH_URL:', AUTH_URL);
  console.log('[API] Using LOCATION_URL:', LOCATION_URL);
}

export default API_BASE;
