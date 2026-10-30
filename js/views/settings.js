/**
 * SETTINGS VIEW CONTROLLER
 * Examination date/time management, Profile info, Firebase configuration,
 * JSON Data Export & Import / Backup Restore, and curriculum tools.
 */

import { state, eventBus } from '../state.js';
import { saveExamDate, exportUserData, importUserData, resetCurriculumToDefault } from '../db.js';
import { logoutUser } from '../auth.js';
import { getActiveFirebaseConfig, saveFirebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

export function renderSettingsView() {
  const container = document.getElementById('view-settings');
  if (!container) return;

  const currentExamDate = state.settings.examDate || '2027-02-19T09:00:00';
  const examDateParts = currentExamDate.split('T');
  const dateVal = examDateParts[0];
  const timeVal = examDateParts[1] ? examDateParts[1].substring(0, 5) : '09:00';

  const user = state.currentUser || {
    displayName: 'Guest Student',
    email: 'local_offline@session',
    photoURL: 'assets/logo.svg'
  };

  const isConfigured = isFirebaseConfigured();

  container.innerHTML = `
    <!-- Settings Top Title -->
    <div class="view-header-flex">
      <div>
        <h1 class="view-main-title">System Settings &amp; Profile</h1>
        <p class="view-subtitle">Customize examination target dates, manage cloud backup, and configure academic storage.</p>
      </div>
    </div>

    <div class="settings-grid">
      <!-- 1. Examination Target Schedule -->
      <div class="luxury-card settings-card">
        <div class="settings-card-header">
          <div class="settings-header-icon icon-gold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
          </div>
          <div>
            <h2 class="card-gold-title">Fourth Year Final Examination Date</h2>
            <p class="settings-desc">Controls the live countdown timer on your dashboard and top banner.</p>
          </div>
        </div>

        <form id="form-exam-date" class="settings-form">
          <div class="form-row-dual">
            <div class="form-group">
              <label class="form-label" for="setting-exam-date">Examination Date</label>
              <input type="date" id="setting-exam-date" class="form-control" value="${dateVal}" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="setting-exam-time">Examination Time</label>
              <input type="time" id="setting-exam-time" class="form-control" value="${timeVal}" required>
            </div>
          </div>
          <button type="submit" class="btn btn-gold btn-sm">Update Examination Schedule</button>
        </form>
      </div>

      <!-- 2. Student Account & Cloud Authentication -->
      <div class="luxury-card settings-card">
        <div class="settings-card-header">
          <div class="settings-header-icon icon-blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div>
            <h2 class="card-gold-title">Student Profile &amp; Authentication</h2>
            <p class="settings-desc">Connected Google Identity &amp; Cross-Device Sync Status.</p>
          </div>
        </div>

        <div class="profile-info-box">
          <div class="profile-avatar-large">
            <img src="${user.photoURL || 'assets/logo.svg'}" alt="Avatar" class="user-avatar-img">
          </div>
          <div class="profile-meta-details">
            <h3 class="profile-user-name user-display-name">${escapeHtml(user.displayName)}</h3>
            <p class="profile-user-email user-display-email">${escapeHtml(user.email)}</p>
            <span class="auth-sync-status ${isConfigured && !state.isGuestMode ? 'status-cloud' : 'status-local'}">
              ${isConfigured && !state.isGuestMode ? 'Cloud Firestore Synchronized' : 'Offline / Local Session Active'}
            </span>
          </div>
        </div>

        <div class="profile-actions-bar">
          <button class="btn btn-secondary btn-sm" id="btn-settings-open-firebase">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            Firebase Config
          </button>
          <button class="btn btn-danger btn-sm" id="btn-settings-logout">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Sign Out
          </button>
        </div>
      </div>

      <!-- 3. Data Export & Backup Restore -->
      <div class="luxury-card settings-card">
        <div class="settings-card-header">
          <div class="settings-header-icon icon-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <div>
            <h2 class="card-gold-title">Data Backup &amp; Restore</h2>
            <p class="settings-desc">Export your entire academic database as a JSON file or restore from a previous backup.</p>
          </div>
        </div>

        <div class="backup-actions-grid">
          <div class="backup-box">
            <h3 class="backup-box-title">Export Academic Data</h3>
            <p class="backup-box-text">Download a complete snapshot containing all subjects, lectures, calendar tasks, notes, and progress history.</p>
            <button class="btn btn-secondary btn-sm" id="btn-export-data">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export JSON Backup
            </button>
          </div>

          <div class="backup-box">
            <h3 class="backup-box-title">Restore from Backup</h3>
            <p class="backup-box-text">Upload a previously exported JSON backup file. All entries will be validated before restoring.</p>
            <input type="file" id="file-import-input" accept=".json" style="display: none;">
            <button class="btn btn-gold btn-sm" id="btn-trigger-import">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Select Backup File (.json)
            </button>
          </div>
        </div>
      </div>

      <!-- 4. Curriculum Reset & Maintenance -->
      <div class="luxury-card settings-card">
        <div class="settings-card-header">
          <div class="settings-header-icon icon-orange">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
          </div>
          <div>
            <h2 class="card-gold-title">Curriculum Reset &amp; Defaults</h2>
            <p class="settings-desc">Reset the 5 primary medical subjects and lectures back to their initial state.</p>
          </div>
        </div>

        <div class="reset-curriculum-wrap">
          <p class="text-muted text-sm" style="margin-bottom: 1rem;">
            If you ever need to restore the official initial curriculum for Pediatrics, Anesthesia, Psychiatry, Tropical Medicine, and Rheumatology, use the option below.
          </p>
          <button class="btn btn-secondary btn-sm" id="btn-reset-curriculum">
            Reset to Official Initial Curriculum
          </button>
        </div>
      </div>
    </div>
  `;

  attachSettingsEvents();
}

function attachSettingsEvents() {
  // Update Exam Date Form
  const examForm = document.getElementById('form-exam-date');
  if (examForm) {
    examForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('setting-exam-date').value;
      const timeVal = document.getElementById('setting-exam-time').value || '09:00';
      const iso = `${dateVal}T${timeVal}:00`;

      await saveExamDate(iso);
      alert("Examination schedule updated successfully!");
    });
  }

  // Firebase Config Modal button
  const fbBtn = document.getElementById('btn-settings-open-firebase');
  if (fbBtn) {
    fbBtn.addEventListener('click', () => {
      const modal = document.getElementById('modal-firebase-config');
      if (modal) modal.classList.add('active');
    });
  }

  // Sign out
  const logoutBtn = document.getElementById('btn-settings-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Are you sure you want to sign out?")) {
        await logoutUser();
      }
    });
  }

  // Export Data
  const exportBtn = document.getElementById('btn-export-data');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportUserData();
    });
  }

  // Import Data
  const triggerImportBtn = document.getElementById('btn-trigger-import');
  const fileInput = document.getElementById('file-import-input');
  if (triggerImportBtn && fileInput) {
    triggerImportBtn.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          await importUserData(event.target.result);
          alert("Backup successfully restored! All subjects and tasks have been synchronized.");
          renderSettingsView();
        } catch (err) {
          alert(`Backup Import Error: ${err.message}`);
        }
      };
      reader.readAsText(file);
    });
  }

  // Reset Curriculum
  const resetBtn = document.getElementById('btn-reset-curriculum');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const confirmed = confirm("Are you sure you want to reset all subjects to the default fourth-year curriculum?\n\nCustom added lectures and completion checkboxes will be reset.");
      if (confirmed) {
        await resetCurriculumToDefault();
        alert("Medical curriculum successfully restored to default structure.");
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

