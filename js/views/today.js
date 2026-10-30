/**
 * TODAY'S TASKS (DAILY AGENDA) VIEW CONTROLLER
 * Automatic agenda retrieval for the active day with interactive completion,
 * progress tracking, and full calendar synchronization.
 */

import { state, eventBus } from '../state.js';
import { formatDualDate } from '../hijri.js';
import { toggleTaskCompletion, deleteTask } from '../db.js';

let activeAgendaDate = new Date(); // Defaults to actual today

export function renderTodayView() {
  const container = document.getElementById('view-today');
  if (!container) return;

  const isoDate = activeAgendaDate.toISOString().split('T')[0];
  const actualTodayIso = new Date().toISOString().split('T')[0];
  const isActualToday = isoDate === actualTodayIso;
  const dualDate = formatDualDate(activeAgendaDate);

  const dayTasks = state.tasks.filter(t => t.date === isoDate);
  const completedCount = dayTasks.filter(t => t.completed).length;
  const pendingCount = dayTasks.length - completedCount;
  const percent = dayTasks.length > 0 ? Math.round((completedCount / dayTasks.length) * 100) : 0;

  container.innerHTML = `
    <!-- Top Agenda Navigation -->
    <div class="view-header-flex">
      <div>
        <h1 class="view-main-title">Today's Academic Agenda</h1>
        <p class="view-subtitle">Focused daily checklist synchronized in real-time with your medical calendar.</p>
      </div>

      <div class="agenda-date-controls">
        <button class="btn btn-secondary btn-sm" id="btn-agenda-prev">&larr; Yesterday</button>
        ${!isActualToday ? `<button class="btn btn-gold btn-sm" id="btn-agenda-today">Go to Today</button>` : ''}
        <button class="btn btn-secondary btn-sm" id="btn-agenda-next">Tomorrow &rarr;</button>
        <button class="btn btn-gold btn-sm" id="btn-agenda-add-task">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Task
        </button>
      </div>
    </div>

    <!-- Active Day Banner & Progress Card -->
    <div class="luxury-card today-agenda-card">
      <div class="agenda-card-header">
        <div class="agenda-date-info">
          <div class="agenda-day-badge-wrap">
            <h2 class="agenda-gregorian-title">${dualDate.gregorian}</h2>
            ${isActualToday ? `<span class="badge-today-large">TODAY</span>` : `<span class="badge-past-future">${formatRelativeDay(activeAgendaDate)}</span>`}
          </div>
          <p class="agenda-hijri-subtitle">${dualDate.hijri}</p>
        </div>

        <div class="agenda-mini-stats">
          <div class="agenda-stat-pill">
            <span class="pill-number">${dayTasks.length}</span>
            <span class="pill-title">Scheduled</span>
          </div>
          <div class="agenda-stat-pill pill-completed">
            <span class="pill-number">${completedCount}</span>
            <span class="pill-title">Completed</span>
          </div>
          <div class="agenda-stat-pill pill-pending">
            <span class="pill-number">${pendingCount}</span>
            <span class="pill-title">Pending</span>
          </div>
        </div>
      </div>

      <!-- Daily Completion Progress Bar -->
      <div class="daily-progress-section">
        <div class="daily-progress-header">
          <span>Daily Completion Rate</span>
          <span class="daily-percent-label gold-text"><strong>${percent}%</strong></span>
        </div>
        <div class="progress-bar-track progress-bar-lg">
          <div class="progress-bar-fill gold-gradient" style="width: ${percent}%;"></div>
        </div>
      </div>
    </div>

    <!-- Daily Tasks Checklist Container -->
    <div class="agenda-tasks-section">
      <div class="agenda-section-header">
        <h3 class="agenda-list-title">Schedule for ${isActualToday ? 'Today' : dualDate.gregorian.split(',')[0]}</h3>
        <span class="text-muted text-sm">${dayTasks.length} task${dayTasks.length === 1 ? '' : 's'} registered</span>
      </div>

      <div class="agenda-tasks-list" id="agenda-tasks-list">
        ${dayTasks.length === 0 ? `
          <div class="luxury-card empty-agenda-state">
            <div class="empty-icon-wrap">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <h3 class="card-gold-title">No Tasks Scheduled for This Date</h3>
            <p class="text-muted">Take this time to review previous notes or plan today's study sessions.</p>
            <button class="btn btn-gold" id="btn-empty-agenda-add">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Add Task for This Day
            </button>
          </div>
        ` : dayTasks.map(task => `
          <div class="agenda-task-item luxury-card ${task.completed ? 'task-done' : ''}" data-task-id="${task.id}">
            <div class="agenda-item-left">
              <label class="custom-checkbox">
                <input type="checkbox" class="agenda-toggle-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                <span class="checkmark"></span>
              </label>
              <div class="agenda-task-info">
                <div class="agenda-title-row">
                  <span class="agenda-task-title ${task.completed ? 'text-strikethrough text-muted' : ''}">${escapeHtml(task.title)}</span>
                  ${task.subjectId ? `<span class="task-subject-tag">${getSubjectName(task.subjectId)}</span>` : ''}
                </div>
                ${task.description ? `<p class="agenda-task-desc">${escapeHtml(task.description)}</p>` : ''}
                <div class="agenda-task-meta">
                  ${task.completed && task.completedAt ? `
                    <span class="meta-tag tag-success">
                      Done at ${new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ` : `
                    <span class="meta-tag tag-pending">Pending</span>
                  `}
                  ${task.lectureId ? `<span class="meta-tag tag-linked">Linked to Lecture</span>` : ''}
                </div>
              </div>
            </div>

            <div class="agenda-item-right">
              <button class="btn btn-sm btn-secondary btn-agenda-details" data-id="${task.id}">
                Details
              </button>
              <button class="btn-icon-xs btn-agenda-delete text-danger" data-id="${task.id}" title="Delete Task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  attachAgendaEvents(isoDate);
}

function formatRelativeDay(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  return 'Today';
}

function getSubjectName(subjectId) {
  const s = state.subjects.find(sub => sub.id === subjectId);
  return s ? s.title : '';
}

function attachAgendaEvents(isoDate) {
  // Navigation
  const prevBtn = document.getElementById('btn-agenda-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      activeAgendaDate.setDate(activeAgendaDate.getDate() - 1);
      renderTodayView();
    });
  }

  const nextBtn = document.getElementById('btn-agenda-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      activeAgendaDate.setDate(activeAgendaDate.getDate() + 1);
      renderTodayView();
    });
  }

  const todayBtn = document.getElementById('btn-agenda-today');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      activeAgendaDate = new Date();
      renderTodayView();
    });
  }

  // Add Task
  const addBtn = document.getElementById('btn-agenda-add-task');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.openAddTaskModal(isoDate);
    });
  }

  const emptyAddBtn = document.getElementById('btn-empty-agenda-add');
  if (emptyAddBtn) {
    emptyAddBtn.addEventListener('click', () => {
      window.openAddTaskModal(isoDate);
    });
  }

  // Checkbox toggle (syncs with Firestore and updates Calendar)
  document.querySelectorAll('.agenda-toggle-check').forEach(input => {
    input.addEventListener('change', async () => {
      const taskId = input.getAttribute('data-id');
      await toggleTaskCompletion(taskId);
    });
  });

  // Task details
  document.querySelectorAll('.btn-agenda-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.getAttribute('data-id');
      window.openTaskDetailsModal(taskId);
    });
  });

  // Delete task
  document.querySelectorAll('.btn-agenda-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const taskId = btn.getAttribute('data-id');
      if (confirm("Delete this scheduled task?")) {
        await deleteTask(taskId);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

