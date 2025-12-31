import Constants from 'expo-constants';

// Single source of truth: set API_URL in app.json → expo.extra.API_URL
// Recommended format: "http://<YOUR-IP>:5000/api/auth"
const configuredUrl = Constants?.expoConfig?.extra?.API_URL;

// Keep original for backwards compatibility with existing auth calls
export const API_URL = configuredUrl;

// Derive base (strip trailing /auth if present) for other services like location
export const API_BASE = configuredUrl?.replace(/\/?auth$/, '') || configuredUrl;
export const AUTH_URL = `${API_BASE}/auth`;
export const LOCATION_URL = `${API_BASE}/location`;

if (__DEV__) {
  console.log('[API] Using API_URL:', API_URL);
  console.log('[API] Using API_BASE:', API_BASE);
}

export default API_URL;
