/**
 * MAIN APPLICATION ENTRY POINT & ROUTING
 * Initializes Firebase, handles navigation, reactive event listeners,
 * and universal modals (Task Creator, Task Details, Exam Editor, Lecture Notes, Firebase Config).
 */

import { state, eventBus } from './state.js';
import { initAuth, signInWithGoogle, logoutUser, enterGuestMode } from './auth.js';
import { initCountdown } from './countdown.js';
import { formatDualDate } from './hijri.js';
import { addTask, updateTask, deleteTask, toggleTaskCompletion, saveExamDate, updateLectureNotes } from './db.js';
import { getActiveFirebaseConfig, saveFirebaseConfig } from './firebase-config.js';

// Views
import { renderDashboard } from './views/dashboard.js';
import { renderSubjectsView } from './views/subjects.js';
import { renderCalendarView } from './views/calendar.js';
import { renderTodayView } from './views/today.js';
import { renderAnalyticsView } from './views/analytics.js';
import { renderSettingsView } from './views/settings.js';

document.addEventListener('DOMContentLoaded', async () => {
  initTopHeaderDate();
  setupNavigation();
  setupModals();
  setupAuthButtons();
  setupFirebaseConfigForm();

  // Initialize Auth & Database
  await initAuth();
  initCountdown();

  // Listen to centralized data events to re-render the active view
  eventBus.on('dataChanged', () => {
    renderCurrentView();
  });

  eventBus.on('authChanged', () => {
    renderCurrentView();
  });

  // Initial render
  navigateTo('dashboard');
});

// ---------------- NAVIGATION & ROUTING ---------------- //

export function navigateTo(viewName) {
  state.activeView = viewName;

  // Update views visibility
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.add('hidden');
    view.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewName}`);
  if (targetView) {
    targetView.classList.remove('hidden');
    targetView.classList.add('active');
  }

  // Update sidebar active state
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    if (item.getAttribute('data-view') === viewName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Render view
  renderCurrentView();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('app-sidebar');
  if (sidebar && window.innerWidth <= 1024) {
    sidebar.classList.remove('open');
  }
}

window.navigateTo = navigateTo;

function renderCurrentView() {
  switch (state.activeView) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'subjects':
      renderSubjectsView();
      break;
    case 'calendar':
      renderCalendarView();
      break;
    case 'today':
      renderTodayView();
      break;
    case 'analytics':
      renderAnalyticsView();
      break;
    case 'settings':
      renderSettingsView();
      break;
    default:
      renderDashboard();
  }
}

function setupNavigation() {
  // Sidebar items
  document.querySelectorAll('.sidebar-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (view) navigateTo(view);
    });
  });

  // In-page navigation links (e.g. data-navigate="calendar")
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-navigate]');
    if (target) {
      const view = target.getAttribute('data-navigate');
      if (view) navigateTo(view);
    }
  });

  // Sidebar toggle button (Mobile & Desktop collapse)
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const sidebar = document.getElementById('app-sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
      sidebar.classList.toggle('open');
    });
  }
}

function initTopHeaderDate() {
  const dual = formatDualDate(new Date());
  const headerDateEl = document.getElementById('top-bar-dual-date');
  if (headerDateEl) {
    headerDateEl.innerHTML = `
      <span class="top-greg">${dual.gregorian}</span>
      <span class="top-separator">&bull;</span>
      <span class="top-hijri gold-text">${dual.hijri}</span>
    `;
  }
}

function setupAuthButtons() {
  const googleLoginBtn = document.getElementById('btn-google-login');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      await signInWithGoogle();
    });
  }

  const guestBtn = document.getElementById('btn-guest-mode');
  if (guestBtn) {
    guestBtn.addEventListener('click', () => {
      enterGuestMode();
    });
  }

  const topLogoutBtn = document.getElementById('top-bar-logout');
  if (topLogoutBtn) {
    topLogoutBtn.addEventListener('click', async () => {
      if (confirm("Sign out of رابعة طب?")) {
        await logoutUser();
      }
    });
  }
}

// ---------------- MODAL MANAGEMENT ---------------- //

function setupModals() {
  // Universal modal close buttons
  document.querySelectorAll('.modal-close-btn, .modal-cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });

  // Close modal when clicking on backdrop
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });

  // Setup Add Task Form
  setupAddTaskForm();

  // Setup Edit Exam Form
  setupEditExamModal();

  // Setup Lecture Notes Form
  setupLectureNotesModal();
}

// 1. ADD TASK MODAL (TWO OPTIONS: CUSTOM TASK & TASK FROM SUBJECTS)
window.openAddTaskModal = function(defaultDate) {
  const modal = document.getElementById('modal-add-task');
  if (!modal) return;

  const dateInput = document.getElementById('task-date-input');
  if (dateInput) {
    dateInput.value = defaultDate || new Date().toISOString().split('T')[0];
  }

  const titleInput = document.getElementById('task-title-input');
  if (titleInput) titleInput.value = '';

  const descInput = document.getElementById('task-desc-input');
  if (descInput) descInput.value = '';

  // Reset & Populate Subject Dropdown
  const subjectSelect = document.getElementById('task-subject-select');
  const lectureSelect = document.getElementById('task-lecture-select');

  if (subjectSelect) {
    subjectSelect.innerHTML = `<option value="">-- Optional: Select Subject --</option>` +
      state.subjects.map(s => `<option value="${s.id}">${escapeHtml(s.title)}</option>`).join('');
  }

  if (lectureSelect) {
    lectureSelect.innerHTML = `<option value="">-- First Choose a Subject --</option>`;
    lectureSelect.disabled = true;
  }

  modal.classList.add('active');
  if (titleInput) titleInput.focus();
};

function setupAddTaskForm() {
  const subjectSelect = document.getElementById('task-subject-select');
  const lectureSelect = document.getElementById('task-lecture-select');
  const titleInput = document.getElementById('task-title-input');
  const taskForm = document.getElementById('form-add-task');

  // Dynamic dependent dropdowns: Subject -> Branch / Lecture
  if (subjectSelect && lectureSelect) {
    subjectSelect.addEventListener('change', () => {
      const sId = subjectSelect.value;
      if (!sId) {
        lectureSelect.innerHTML = `<option value="">-- First Choose a Subject --</option>`;
        lectureSelect.disabled = true;
        return;
      }

      const subject = state.subjects.find(s => s.id === sId);
      if (!subject || !subject.branches || subject.branches.length === 0) {
        lectureSelect.innerHTML = `<option value="">-- No branches available in this subject --</option>`;
        lectureSelect.disabled = true;
        return;
      }

      let optionsHtml = `<option value="">-- Select Branch / Lecture --</option>`;
      subject.branches.forEach(branch => {
        optionsHtml += `<optgroup label="${escapeHtml(branch.title)}">`;
        (branch.lectures || []).forEach(lec => {
          optionsHtml += `<option value="${lec.id}" data-branch-id="${branch.id}" data-lecture-title="${escapeHtml(lec.title)}">${escapeHtml(lec.title)}</option>`;
        });
        optionsHtml += `</optgroup>`;
      });

      lectureSelect.innerHTML = optionsHtml;
      lectureSelect.disabled = false;
    });

    // When selecting a lecture, auto-fill the task title with the exact lecture title!
    lectureSelect.addEventListener('change', () => {
      const selectedOption = lectureSelect.options[lectureSelect.selectedIndex];
      if (selectedOption && selectedOption.value) {
        const lectureTitle = selectedOption.getAttribute('data-lecture-title');
        if (titleInput && lectureTitle) {
          titleInput.value = lectureTitle;
        }
      }
    });
  }

  if (taskForm) {
    taskForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      let title = titleInput.value.trim();
      const date = document.getElementById('task-date-input').value;
      const desc = document.getElementById('task-desc-input').value.trim();
      const subjectId = subjectSelect ? subjectSelect.value : null;

      let lectureId = null;
      let branchId = null;

      if (lectureSelect && lectureSelect.value) {
        lectureId = lectureSelect.value;
        const opt = lectureSelect.options[lectureSelect.selectedIndex];
        branchId = opt ? opt.getAttribute('data-branch-id') : null;

        // If title was left blank, use lecture title
        if (!title && opt) {
          title = opt.getAttribute('data-lecture-title');
        }
      }

      if (!title) {
        alert("Please enter a task title or select a subject lecture.");
        return;
      }

      await addTask({
        title,
        date,
        subjectId: subjectId || null,
        branchId: branchId || null,
        lectureId: lectureId || null,
        description: desc
      });

      // Close modal
      const modal = document.getElementById('modal-add-task');
      if (modal) modal.classList.remove('active');
    });
  }
}

// 2. TASK DETAILS & EDIT MODAL
window.openTaskDetailsModal = function(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const modal = document.getElementById('modal-task-details');
  if (!modal) return;

  const subject = task.subjectId ? state.subjects.find(s => s.id === task.subjectId) : null;
  let lectureTitle = '';
  if (subject && task.lectureId) {
    for (const b of (subject.branches || [])) {
      const l = (b.lectures || []).find(lec => lec.id === task.lectureId);
      if (l) {
        lectureTitle = l.title;
        break;
      }
    }
  }

  modal.innerHTML = `
    <div class="modal-dialog luxury-card">
      <div class="modal-header">
        <h2 class="card-gold-title">Task Details</h2>
        <button class="modal-close-btn">&times;</button>
      </div>

      <div class="modal-body">
        <div class="task-details-status-row">
          <span class="status-badge ${task.completed ? 'badge-complete' : 'badge-pending'}">
            ${task.completed ? 'COMPLETED' : 'PENDING'}
          </span>
          <span class="text-muted text-sm">Created: ${new Date(task.createdAt || Date.now()).toLocaleDateString()}</span>
        </div>

        <div class="form-group" style="margin-top: 1rem;">
          <label class="form-label" for="edit-task-title">Task Title</label>
          <input type="text" id="edit-task-title" class="form-control" value="${escapeHtml(task.title)}" required>
        </div>

        <div class="form-group">
          <label class="form-label" for="edit-task-date">Scheduled Date</label>
          <input type="date" id="edit-task-date" class="form-control" value="${task.date}" required>
        </div>

        <div class="form-group">
          <label class="form-label">Subject Link</label>
          <p class="details-static-text">${subject ? escapeHtml(subject.title) : 'None (Custom Task)'}</p>
        </div>

        ${lectureTitle ? `
          <div class="form-group">
            <label class="form-label">Linked Lecture</label>
            <p class="details-static-text gold-text">${escapeHtml(lectureTitle)}</p>
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="edit-task-desc">Description &amp; Study Notes</label>
          <textarea id="edit-task-desc" class="form-control" rows="3">${escapeHtml(task.description || '')}</textarea>
        </div>
      </div>

      <div class="modal-footer-flex">
        <button class="btn btn-danger btn-sm" id="btn-delete-task-modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          Delete Task
        </button>

        <div class="footer-right-buttons">
          <button class="btn btn-secondary btn-sm" id="btn-toggle-task-complete-modal">
            ${task.completed ? 'Mark Incomplete' : 'Mark Completed'}
          </button>
          <button class="btn btn-gold btn-sm" id="btn-save-task-edits">Save Changes</button>
        </div>
      </div>
    </div>
  `;

  // Attach event handlers inside details modal
  modal.querySelector('.modal-close-btn').addEventListener('click', () => modal.classList.remove('active'));

  modal.querySelector('#btn-save-task-edits').addEventListener('click', async () => {
    const newTitle = modal.querySelector('#edit-task-title').value.trim();
    const newDate = modal.querySelector('#edit-task-date').value;
    const newDesc = modal.querySelector('#edit-task-desc').value.trim();

    if (!newTitle) {
      alert("Task title cannot be empty.");
      return;
    }

    await updateTask(task.id, {
      title: newTitle,
      date: newDate,
      description: newDesc
    });

    modal.classList.remove('active');
  });

  modal.querySelector('#btn-toggle-task-complete-modal').addEventListener('click', async () => {
    await toggleTaskCompletion(task.id);
    modal.classList.remove('active');
  });

  modal.querySelector('#btn-delete-task-modal').addEventListener('click', async () => {
    if (confirm("Are you sure you want to delete this task?")) {
      await deleteTask(task.id);
      modal.classList.remove('active');
    }
  });

  modal.classList.add('active');
};

// 3. EDIT EXAM MODAL
window.openEditExamModal = function() {
  const modal = document.getElementById('modal-edit-exam');
  if (!modal) return;

  const currentExam = state.settings.examDate || '2027-02-19T09:00:00';
  const parts = currentExam.split('T');

  const dateInput = document.getElementById('modal-exam-date');
  const timeInput = document.getElementById('modal-exam-time');

  if (dateInput) dateInput.value = parts[0];
  if (timeInput) timeInput.value = parts[1] ? parts[1].substring(0, 5) : '09:00';

  modal.classList.add('active');
};

function setupEditExamModal() {
  const form = document.getElementById('form-modal-edit-exam');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dateVal = document.getElementById('modal-exam-date').value;
      const timeVal = document.getElementById('modal-exam-time').value || '09:00';
      const iso = `${dateVal}T${timeVal}:00`;

      await saveExamDate(iso);
      const modal = document.getElementById('modal-edit-exam');
      if (modal) modal.classList.remove('active');
    });
  }
}

// 4. LECTURE NOTES MODAL
window.openLectureNotesModal = function(subjectId, branchId, lectureId, title, notes) {
  const modal = document.getElementById('modal-lecture-notes');
  if (!modal) return;

  document.getElementById('notes-modal-lecture-title').textContent = title;
  const textarea = document.getElementById('lecture-notes-textarea');
  if (textarea) textarea.value = notes || '';

  const saveBtn = document.getElementById('btn-save-lecture-notes');
  if (saveBtn) {
    saveBtn.onclick = async () => {
      await updateLectureNotes(subjectId, branchId, lectureId, textarea.value);
      modal.classList.remove('active');
    };
  }

  modal.classList.add('active');
};

function setupLectureNotesModal() {
  // Handled in openLectureNotesModal
}

// 5. QUICK ADD LECTURE
window.openAddLectureModal = function() {
  const subjectId = prompt("Enter Subject Name or ID (or go to Subjects tab to organize directly):");
  if (subjectId) {
    navigateTo('subjects');
  }
};

// 6. FIREBASE CONFIG MODAL IN-APP SETUP
function setupFirebaseConfigForm() {
  const form = document.getElementById('form-firebase-config');
  if (!form) return;

  const current = getActiveFirebaseConfig();
  if (current) {
    if (document.getElementById('fb-api-key') && current.apiKey !== "YOUR_API_KEY") {
      document.getElementById('fb-api-key').value = current.apiKey || '';
    }
    if (document.getElementById('fb-auth-domain') && current.authDomain !== "YOUR_PROJECT_ID.firebaseapp.com") {
      document.getElementById('fb-auth-domain').value = current.authDomain || '';
    }
    if (document.getElementById('fb-project-id') && current.projectId !== "YOUR_PROJECT_ID") {
      document.getElementById('fb-project-id').value = current.projectId || '';
    }
    if (document.getElementById('fb-storage-bucket')) {
      document.getElementById('fb-storage-bucket').value = current.storageBucket || '';
    }
    if (document.getElementById('fb-messaging-sender-id')) {
      document.getElementById('fb-messaging-sender-id').value = current.messagingSenderId || '';
    }
    if (document.getElementById('fb-app-id')) {
      document.getElementById('fb-app-id').value = current.appId || '';
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const config = {
      apiKey: document.getElementById('fb-api-key').value.trim(),
      authDomain: document.getElementById('fb-auth-domain').value.trim(),
      projectId: document.getElementById('fb-project-id').value.trim(),
      storageBucket: document.getElementById('fb-storage-bucket').value.trim(),
      messagingSenderId: document.getElementById('fb-messaging-sender-id').value.trim(),
      appId: document.getElementById('fb-app-id').value.trim()
    };

    saveFirebaseConfig(config);
    alert("Firebase Configuration Saved! The application will now reload to connect with your Firebase project.");
    window.location.reload();
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

