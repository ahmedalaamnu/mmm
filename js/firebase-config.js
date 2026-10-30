/**
 * FIREBASE CONFIGURATION & INITIALIZATION
 * 
 * Replace the values below with your Firebase project credentials from the Firebase Console:
 * https://console.firebase.google.com/
 * 
 * You can also enter or update them anytime directly within the application's Settings!
 */

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const STORAGE_KEY = 'rabia_tib_firebase_config';

export function getActiveFirebaseConfig() {
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.apiKey && parsed.apiKey !== "YOUR_API_KEY") {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Could not read custom Firebase config from localStorage", e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save Firebase config", e);
    return false;
  }
}

export function isFirebaseConfigured() {
  const config = getActiveFirebaseConfig();
  return Boolean(
    config &&
    config.apiKey &&
    config.apiKey !== "YOUR_API_KEY" &&
    config.projectId &&
    config.projectId !== "YOUR_PROJECT_ID"
  );
}

