import Constants from 'expo-constants';

// Single source of truth: set API_URL in app.json → expo.extra.API_URL
// Example: "API_URL": "http://YOUR-PC-IP:5000/api/auth"
const configuredUrl = Constants?.expoConfig?.extra?.API_URL;

export const API_URL = configuredUrl;

if (__DEV__) {
  console.log('[Auth] Using API_URL:', API_URL);
}

export default API_URL;
