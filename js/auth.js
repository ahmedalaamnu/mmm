/**
 * AUTHENTICATION CONTROLLER
 * Real Firebase Google Sign-In with robust fallback and session management.
 */

import { state, eventBus } from './state.js';
import { getActiveFirebaseConfig, isFirebaseConfigured } from './firebase-config.js';
import { initializeDatabase } from './db.js';

let auth = null;
let firestore = null;
let firebaseApp = null;

export async function initAuth() {
  const config = getActiveFirebaseConfig();

  if (isFirebaseConfigured()) {
    try {
      const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
      const { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

      if (!getApps().length) {
        firebaseApp = initializeApp(config);
      } else {
        firebaseApp = getApps()[0];
      }

      auth = getAuth(firebaseApp);
      firestore = getFirestore(firebaseApp);

      onAuthStateChanged(auth, async (user) => {
        if (user) {
          state.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Medical Student',
            photoURL: user.photoURL || 'assets/logo.svg'
          };
          state.isGuestMode = false;
          state.isAuthReady = true;

          await initializeDatabase(firebaseApp, auth, firestore);
          onAuthSuccess();
        } else {
          // Check if guest session active
          const isGuest = sessionStorage.getItem('rabia_tib_guest_session') === 'true';
          if (isGuest) {
            setupGuestSession();
          } else {
            state.currentUser = null;
            state.isGuestMode = false;
            state.isAuthReady = true;
            onAuthLoggedOut();
          }
        }
      });

      return;
    } catch (err) {
      console.warn("Firebase Auth initialization error, checking local session:", err);
    }
  }

  // If Firebase config is not yet supplied:
  const isGuest = sessionStorage.getItem('rabia_tib_guest_session') === 'true';
  if (isGuest) {
    setupGuestSession();
  } else {
    state.currentUser = null;
    state.isGuestMode = false;
    state.isAuthReady = true;
    onAuthLoggedOut();
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured()) {
    // Show configuration guide modal or prompt to configure
    const shouldConfigure = confirm(
      "Firebase is not yet configured with your project API keys.\n\n" +
      "Would you like to open the Firebase Configuration dialog to paste your credentials?\n" +
      "(Click Cancel to enter Offline / Demo Mode immediately without API keys)"
    );

    if (shouldConfigure) {
      const configModal = document.getElementById('modal-firebase-config');
      if (configModal) configModal.classList.add('active');
    } else {
      enterGuestMode();
    }
    return;
  }

  try {
    const { getAuth, signInWithPopup, GoogleAuthProvider } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
    const authInstance = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    await signInWithPopup(authInstance, provider);
  } catch (error) {
    console.error("Google sign-in error:", error);
    alert(`Google Authentication Failed: ${error.message}\n\nYou can also explore the system using Offline / Guest Mode.`);
  }
}

export function enterGuestMode() {
  sessionStorage.setItem('rabia_tib_guest_session', 'true');
  setupGuestSession();
}

async function setupGuestSession() {
  state.currentUser = {
    uid: 'local_student',
    email: 'student@rabiatib.med',
    displayName: 'Dr. Medical Student',
    photoURL: 'assets/logo.svg'
  };
  state.isGuestMode = true;
  state.isAuthReady = true;

  await initializeDatabase(null, null, null);
  onAuthSuccess();
}

export async function logoutUser() {
  sessionStorage.removeItem('rabia_tib_guest_session');
  if (auth && !state.isGuestMode) {
    try {
      const { signOut } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js');
      await signOut(auth);
    } catch (e) {
      console.error("Sign out error", e);
    }
  }
  state.currentUser = null;
  state.isGuestMode = false;
  onAuthLoggedOut();
}

function onAuthSuccess() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');

  if (loginScreen) loginScreen.classList.add('hidden');
  if (appContainer) appContainer.classList.remove('hidden');

  // Update profile elements
  updateProfileDisplays();
  eventBus.emit('authChanged', state.currentUser);
}

function onAuthLoggedOut() {
  const loginScreen = document.getElementById('login-screen');
  const appContainer = document.getElementById('app-container');

  if (loginScreen) loginScreen.classList.remove('hidden');
  if (appContainer) appContainer.classList.add('hidden');

  eventBus.emit('authChanged', null);
}

export function updateProfileDisplays() {
  if (!state.currentUser) return;
  const nameEls = document.querySelectorAll('.user-display-name');
  const emailEls = document.querySelectorAll('.user-display-email');
  const avatarEls = document.querySelectorAll('.user-avatar-img');

  nameEls.forEach(el => el.textContent = state.currentUser.displayName || 'Medical Student');
  emailEls.forEach(el => el.textContent = state.currentUser.email || '');
  avatarEls.forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = state.currentUser.photoURL || 'assets/logo.svg';
    }
  });
}

