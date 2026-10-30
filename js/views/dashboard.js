/**
 * DASHBOARD VIEW CONTROLLER
 * Dynamic academic control panel with real-time statistics and exam countdown.
 */

import { state, eventBus, getAcademicStats, getSubjectStats } from '../state.js';
import { formatDualDate } from '../hijri.js';

export function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  if (!container) return;

  const stats = getAcademicStats();
  const dualDate = formatDualDate(new Date());

  container.innerHTML = `
    <!-- Top Welcome & Date Banner -->
    <div class="dashboard-banner">
      <div class="banner-welcome">
        <h1 class="banner-title">Welcome back, <span class="user-display-name">${state.currentUser ? (state.currentUser.displayName || 'Doctor') : 'Doctor'}</span></h1>
        <p class="banner-subtitle">Fourth Year Medical Academic Command Center &bull; رابعة طب</p>
      </div>
      <div class="banner-dates">
        <div class="date-badge gregorian-badge">
          <span class="date-label">Gregorian</span>
          <span class="date-value">${dualDate.gregorian}</span>
        </div>
        <div class="date-badge hijri-badge">
          <span class="date-label">Hijri (Umm al-Qura)</span>
          <span class="date-value">${dualDate.hijri}</span>
        </div>
      </div>
    </div>

    <!-- Examination Live Countdown Section -->
    <div class="luxury-card exam-countdown-card">
      <div class="card-header-flex">
        <div class="header-with-badge">
          <h2 class="card-gold-title">Final Examination Countdown</h2>
          <span class="exam-status-badge exam-active">COUNTDOWN ACTIVE</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="btn-edit-exam-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          Edit Exam Date
        </button>
      </div>
      <p class="exam-target-text">Target Examination: <strong class="exam-target-display">Loading...</strong></p>

      <div class="countdown-grid">
        <div class="countdown-box">
          <span class="countdown-num exam-days">--</span>
          <span class="countdown-label">DAYS</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-num exam-hours">--</span>
          <span class="countdown-label">HOURS</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-num exam-minutes">--</span>
          <span class="countdown-label">MINUTES</span>
        </div>
        <div class="countdown-box">
          <span class="countdown-num exam-seconds">--</span>
          <span class="countdown-label">SECONDS</span>
        </div>
      </div>
    </div>

    <!-- Academic Overview Statistics Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon-wrap icon-gold">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Subjects</span>
          <span class="stat-value" id="stat-total-subjects">${stats.totalSubjects}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap icon-cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Total Lectures</span>
          <span class="stat-value" id="stat-total-lectures">${stats.totalLectures}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap icon-green">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Completed Lectures</span>
          <span class="stat-value" id="stat-completed-lectures">${stats.completedLectures}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap icon-amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Remaining Lectures</span>
          <span class="stat-value" id="stat-remaining-lectures">${stats.remainingLectures}</span>
        </div>
      </div>

      <div class="stat-card stat-card-featured">
        <div class="stat-icon-wrap icon-gold-metallic">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="m4.93 4.93 4.24 4.24"></path><path d="m14.83 9.17 4.24-4.24"></path><path d="m14.83 14.83 4.24 4.24"></path><path d="m9.17 14.83-4.24 4.24"></path></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Overall Completion</span>
          <span class="stat-value" id="stat-overall-percent">${stats.overallCompletionPercentage}%</span>
          <div class="mini-progress-bar">
            <div class="mini-progress-fill" style="width: ${stats.overallCompletionPercentage}%;"></div>
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Tasks Completed</span>
          <span class="stat-value" id="stat-completed-tasks">${stats.completedTasks}</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon-wrap icon-orange">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
        </div>
        <div class="stat-info">
          <span class="stat-label">Pending Tasks</span>
          <span class="stat-value" id="stat-pending-tasks">${stats.pendingTasks}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions Row -->
    <div class="quick-actions-bar">
      <h3 class="quick-actions-title">Quick Actions</h3>
      <div class="actions-buttons-wrap">
        <button class="btn btn-gold" id="btn-quick-add-task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Task
        </button>
        <button class="btn btn-secondary" id="btn-quick-add-lecture">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Add New Lecture
        </button>
        <button class="btn btn-secondary" data-navigate="calendar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          View Calendar
        </button>
        <button class="btn btn-secondary" data-navigate="subjects">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          View Subjects
        </button>
        <button class="btn btn-secondary" data-navigate="analytics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          View Progress
        </button>
      </div>
    </div>

    <!-- Main Dual Columns: Today's Agenda & Subject Progress Snapshot -->
    <div class="dashboard-dual-columns">
      <!-- Left Column: Today's Overview -->
      <div class="luxury-card">
        <div class="card-header-flex">
          <h2 class="card-gold-title">Today's Academic Agenda</h2>
          <button class="btn btn-sm btn-ghost" data-navigate="today">Open Full Day &rarr;</button>
        </div>
        <div class="today-progress-strip">
          <div class="strip-info">
            <span>Today's Progress: <strong>${stats.todayCompleted} / ${stats.todayTotal} completed</strong></span>
            <span class="gold-text"><strong>${stats.todayPercentage}%</strong></span>
          </div>
          <div class="progress-bar-track">
            <div class="progress-bar-fill gold-gradient" style="width: ${stats.todayPercentage}%;"></div>
          </div>
        </div>
        <div class="today-tasks-preview" id="dashboard-today-tasks">
          <!-- Rendered dynamically -->
        </div>
      </div>

      <!-- Right Column: Subjects Progress Overview -->
      <div class="luxury-card">
        <div class="card-header-flex">
          <h2 class="card-gold-title">Subject Curricula Overview</h2>
          <button class="btn btn-sm btn-ghost" data-navigate="subjects">Manage Subjects &rarr;</button>
        </div>
        <div class="subjects-snapshot-list">
          ${renderSubjectsSnapshot()}
        </div>
      </div>
    </div>
  `;

  renderTodayTasksPreview();
  attachDashboardListeners();
}

function renderSubjectsSnapshot() {
  if (state.subjects.length === 0) {
    return `<p class="empty-hint">No subjects initialized.</p>`;
  }

  return state.subjects.map(subject => {
    const sStats = getSubjectStats(subject);
    return `
      <div class="subject-snapshot-item" data-subject-id="${subject.id}">
        <div class="snapshot-header">
          <span class="snapshot-title">${escapeHtml(subject.title)}</span>
          <span class="snapshot-counts">${sStats.completedLectures} / ${sStats.totalLectures} lectures (${sStats.percentage}%)</span>
        </div>
        <div class="progress-bar-track">
          <div class="progress-bar-fill gold-gradient" style="width: ${sStats.percentage}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderTodayTasksPreview() {
  const container = document.getElementById('dashboard-today-tasks');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => t.date === todayStr);

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state-mini">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <p>No tasks scheduled for today.</p>
        <button class="btn btn-sm btn-secondary" id="btn-add-today-task">Add Task for Today</button>
      </div>
    `;
    const addBtn = container.querySelector('#btn-add-today-task');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        window.openAddTaskModal(todayStr);
      });
    }
    return;
  }

  container.innerHTML = todayTasks.map(task => `
    <div class="task-preview-row ${task.completed ? 'task-done' : ''}" data-task-id="${task.id}">
      <label class="custom-checkbox">
        <input type="checkbox" class="task-toggle-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
        <span class="checkmark"></span>
      </label>
      <div class="task-text-info">
        <span class="task-title-text">${escapeHtml(task.title)}</span>
        ${task.subjectId ? `<span class="task-subject-tag">${getSubjectName(task.subjectId)}</span>` : ''}
      </div>
      <button class="btn-icon-xs btn-task-details" data-id="${task.id}" title="View Details">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
      </button>
    </div>
  `).join('');

  // Attach toggles
  container.querySelectorAll('.task-toggle-check').forEach(input => {
    input.addEventListener('change', async (e) => {
      const taskId = e.target.getAttribute('data-id');
      const { toggleTaskCompletion } = await import('../db.js');
      await toggleTaskCompletion(taskId);
    });
  });

  // Attach details
  container.querySelectorAll('.btn-task-details').forEach(btn => {
    btn.addEventListener('click', () => {
      const taskId = btn.getAttribute('data-id');
      window.openTaskDetailsModal(taskId);
    });
  });
}

function getSubjectName(subjectId) {
  const s = state.subjects.find(sub => sub.id === subjectId);
  return s ? s.title : '';
}

function attachDashboardListeners() {
  const editExamBtn = document.getElementById('btn-edit-exam-date');
  if (editExamBtn) {
    editExamBtn.addEventListener('click', () => {
      window.openEditExamModal();
    });
  }

  const quickAddTask = document.getElementById('btn-quick-add-task');
  if (quickAddTask) {
    quickAddTask.addEventListener('click', () => {
      const todayStr = new Date().toISOString().split('T')[0];
      window.openAddTaskModal(todayStr);
    });
  }

  const quickAddLec = document.getElementById('btn-quick-add-lecture');
  if (quickAddLec) {
    quickAddLec.addEventListener('click', () => {
      window.openAddLectureModal();
    });
  }

  // Click on subject snapshot to drill into subject view
  document.querySelectorAll('.subject-snapshot-item').forEach(item => {
    item.addEventListener('click', () => {
      const sId = item.getAttribute('data-subject-id');
      state.selectedSubjectId = sId;
      window.navigateTo('subjects');
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

