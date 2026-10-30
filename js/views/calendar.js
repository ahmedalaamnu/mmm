/**
 * CALENDAR VIEW CONTROLLER
 * Month, Week, and Day views with simultaneous Gregorian & Hijri dates,
 * task indicators, and comprehensive 2-option task creation & task details modal.
 */

import { state, eventBus } from '../state.js';
import { getHijriDate, formatGregorian, formatDualDate } from '../hijri.js';
import { addTask, updateTask, deleteTask, toggleTaskCompletion } from '../db.js';

let currentViewDate = new Date(); // Controls month/week/day navigation

export function renderCalendarView() {
  const container = document.getElementById('view-calendar');
  if (!container) return;

  const currentMode = state.calendarViewMode || 'month';
  const dualToday = formatDualDate(new Date());

  container.innerHTML = `
    <!-- Calendar Top Controls Header -->
    <div class="calendar-top-header">
      <div class="calendar-title-wrap">
        <h1 class="view-main-title">Academic Calendar</h1>
        <p class="view-subtitle">Synchronized scheduling with Gregorian &amp; Islamic Umm al-Qura calendar.</p>
      </div>

      <div class="calendar-actions-bar">
        <!-- View Mode Switcher -->
        <div class="view-mode-tabs">
          <button class="view-mode-btn ${currentMode === 'month' ? 'active' : ''}" data-mode="month">Month</button>
          <button class="view-mode-btn ${currentMode === 'week' ? 'active' : ''}" data-mode="week">Week</button>
          <button class="view-mode-btn ${currentMode === 'day' ? 'active' : ''}" data-mode="day">Day</button>
        </div>

        <!-- Add Task Button -->
        <button class="btn btn-gold" id="btn-calendar-add-task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Task
        </button>
      </div>
    </div>

    <!-- Calendar Navigation & Dual Date Indicator -->
    <div class="calendar-nav-toolbar">
      <div class="nav-button-group">
        <button class="btn btn-sm btn-secondary" id="cal-nav-prev">&larr; Prev</button>
        <button class="btn btn-sm btn-secondary" id="cal-nav-today">Today</button>
        <button class="btn btn-sm btn-secondary" id="cal-nav-next">Next &rarr;</button>
      </div>

      <div class="calendar-current-label" id="calendar-date-display">
        <!-- Displays Month/Year + Hijri info -->
        ${getNavigationDisplayString(currentMode, currentViewDate)}
      </div>

      <div class="calendar-legend">
        <span class="legend-item"><span class="legend-dot dot-pending"></span> Pending Task</span>
        <span class="legend-item"><span class="legend-dot dot-completed"></span> Completed</span>
        <span class="legend-item"><span class="legend-pill today-pill-legend">Today</span></span>
      </div>
    </div>

    <!-- Calendar Body Canvas -->
    <div class="calendar-grid-card luxury-card" id="calendar-grid-container">
      ${renderCalendarContent(currentMode, currentViewDate)}
    </div>
  `;

  attachCalendarEvents();
}

function getNavigationDisplayString(mode, date) {
  if (mode === 'month') {
    const gregMonth = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const hijriMidMonth = getHijriDate(new Date(date.getFullYear(), date.getMonth(), 15));
    return `<strong>${gregMonth}</strong> <span class="nav-hijri-sub">&bull; ${hijriMidMonth.month} ${hijriMidMonth.year}</span>`;
  } else if (mode === 'week') {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    const sStr = startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const eStr = endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `<strong>${sStr} &ndash; ${eStr}</strong>`;
  } else {
    // Day
    const dual = formatDualDate(date);
    return `<strong>${dual.gregorian}</strong> <span class="nav-hijri-sub">&bull; ${dual.hijri}</span>`;
  }
}

function renderCalendarContent(mode, date) {
  if (mode === 'month') {
    return renderMonthGrid(date);
  } else if (mode === 'week') {
    return renderWeekGrid(date);
  } else {
    return renderDayGrid(date);
  }
}

// ---------------- MONTH VIEW ---------------- //
function renderMonthGrid(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Day of week for first day (0 = Sunday)
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const todayStr = new Date().toISOString().split('T')[0];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let html = `
    <div class="calendar-month-grid">
      <div class="calendar-weekdays-row">
        ${dayNames.map(d => `<div class="weekday-header">${d}</div>`).join('')}
      </div>
      <div class="calendar-days-matrix">
  `;

  // Previous month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    const padDay = prevMonthLastDay - i;
    const padDate = new Date(year, month - 1, padDay);
    const padIso = padDate.toISOString().split('T')[0];
    const hijri = getHijriDate(padDate);

    html += `
      <div class="calendar-cell cell-muted" data-date="${padIso}">
        <div class="cell-dates-header">
          <span class="cell-gregorian-day">${padDay}</span>
          <span class="cell-hijri-day">${hijri.day}</span>
        </div>
        <div class="cell-tasks-list">
          ${renderTasksForDate(padIso)}
        </div>
      </div>
    `;
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const cellDate = new Date(year, month, day);
    const isoString = cellDate.toISOString().split('T')[0];
    const isToday = isoString === todayStr;
    const isSelected = isoString === state.selectedCalendarDate;
    const hijri = getHijriDate(cellDate);

    html += `
      <div class="calendar-cell ${isToday ? 'cell-today' : ''} ${isSelected ? 'cell-selected' : ''}" data-date="${isoString}">
        <div class="cell-dates-header">
          <div class="greg-with-today">
            <span class="cell-gregorian-day">${day}</span>
            ${isToday ? `<span class="badge-today-mini">TODAY</span>` : ''}
          </div>
          <span class="cell-hijri-day" title="${hijri.formatted}">${hijri.day} <span class="hijri-month-abbr">${hijri.month.substring(0, 3)}</span></span>
        </div>
        <div class="cell-tasks-list">
          ${renderTasksForDate(isoString)}
        </div>
      </div>
    `;
  }

  // Next month padding to fill 35 or 42 cells
  const filledCells = startingDay + totalDays;
  const totalCellsNeeded = filledCells > 35 ? 42 : 35;
  const trailingDays = totalCellsNeeded - filledCells;

  for (let d = 1; d <= trailingDays; d++) {
    const padDate = new Date(year, month + 1, d);
    const padIso = padDate.toISOString().split('T')[0];
    const hijri = getHijriDate(padDate);

    html += `
      <div class="calendar-cell cell-muted" data-date="${padIso}">
        <div class="cell-dates-header">
          <span class="cell-gregorian-day">${d}</span>
          <span class="cell-hijri-day">${hijri.day}</span>
        </div>
        <div class="cell-tasks-list">
          ${renderTasksForDate(padIso)}
        </div>
      </div>
    `;
  }

  html += `
      </div>
    </div>
  `;

  return html;
}

// ---------------- WEEK VIEW ---------------- //
function renderWeekGrid(date) {
  const startOfWeek = getStartOfWeek(date);
  const todayStr = new Date().toISOString().split('T')[0];

  let html = `<div class="calendar-week-grid">`;

  for (let i = 0; i < 7; i++) {
    const currentDay = new Date(startOfWeek);
    currentDay.setDate(currentDay.getDate() + i);
    const isoString = currentDay.toISOString().split('T')[0];
    const isToday = isoString === todayStr;
    const hijri = getHijriDate(currentDay);
    const dayName = currentDay.toLocaleDateString('en-US', { weekday: 'short' });

    html += `
      <div class="week-column ${isToday ? 'week-col-today' : ''}" data-date="${isoString}">
        <div class="week-col-header">
          <span class="week-day-name">${dayName}</span>
          <div class="week-date-pair">
            <span class="week-greg-num">${currentDay.getDate()}</span>
            <span class="week-hijri-num">${hijri.day} ${hijri.month.substring(0, 4)}</span>
          </div>
          ${isToday ? `<span class="badge-today-mini">TODAY</span>` : ''}
        </div>
        <div class="week-tasks-flow">
          ${renderTasksForDate(isoString, true)}
        </div>
        <button class="btn-xs btn-add-day-task" data-date="${isoString}">+ Add Task</button>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

// ---------------- DAY VIEW ---------------- //
function renderDayGrid(date) {
  const isoString = date.toISOString().split('T')[0];
  const dual = formatDualDate(date);
  const dayTasks = state.tasks.filter(t => t.date === isoString);
  const completed = dayTasks.filter(t => t.completed).length;

  return `
    <div class="calendar-day-view-wrap">
      <div class="day-view-header-strip">
        <div class="day-strip-titles">
          <h2 class="day-large-title">${dual.gregorian}</h2>
          <p class="day-hijri-subtitle">${dual.hijri}</p>
        </div>
        <div class="day-strip-summary">
          <span class="day-tasks-count">${completed} of ${dayTasks.length} tasks completed</span>
          <button class="btn btn-sm btn-gold" id="btn-day-view-add" data-date="${isoString}">+ Add Task</button>
        </div>
      </div>

      <div class="day-view-tasks-container">
        ${dayTasks.length === 0 ? `
          <div class="empty-day-state">
            <p>No tasks scheduled for this day.</p>
            <button class="btn btn-secondary btn-sm" onclick="window.openAddTaskModal('${isoString}')">Schedule First Task</button>
          </div>
        ` : `
          <div class="day-task-card-list">
            ${dayTasks.map(task => `
              <div class="day-task-card ${task.completed ? 'task-done' : ''}" data-task-id="${task.id}">
                <label class="custom-checkbox">
                  <input type="checkbox" class="task-toggle-check" data-id="${task.id}" ${task.completed ? 'checked' : ''}>
                  <span class="checkmark"></span>
                </label>
                <div class="day-task-details">
                  <div class="day-task-title-line">
                    <span class="task-title-main">${escapeHtml(task.title)}</span>
                    ${task.subjectId ? `<span class="task-subject-tag">${getSubjectName(task.subjectId)}</span>` : ''}
                  </div>
                  ${task.description ? `<p class="day-task-desc">${escapeHtml(task.description)}</p>` : ''}
                </div>
                <div class="day-task-actions">
                  <button class="btn-icon-xs btn-open-task-details" data-id="${task.id}" title="Edit Task">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="btn-icon-xs btn-delete-task-direct text-danger" data-id="${task.id}" title="Delete Task">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderTasksForDate(isoDate, isExpanded = false) {
  const tasksForDay = state.tasks.filter(t => t.date === isoDate);
  if (tasksForDay.length === 0) return '';

  return tasksForDay.map(task => `
    <div class="cal-task-pill ${task.completed ? 'task-pill-done' : ''}" 
         data-task-id="${task.id}" 
         title="${escapeHtml(task.title)} ${task.completed ? '(Completed)' : '(Pending)'}"
         onclick="event.stopPropagation(); window.openTaskDetailsModal('${task.id}');">
      <span class="task-status-dot ${task.completed ? 'dot-completed' : 'dot-pending'}"></span>
      <span class="cal-task-text">${escapeHtml(task.title)}</span>
    </div>
  `).join('');
}

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}

function getSubjectName(subjectId) {
  const s = state.subjects.find(sub => sub.id === subjectId);
  return s ? s.title : '';
}

function attachCalendarEvents() {
  // Mode switcher tabs
  document.querySelectorAll('.view-mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      state.calendarViewMode = mode;
      renderCalendarView();
    });
  });

  // Prev navigation
  const prevBtn = document.getElementById('cal-nav-prev');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.calendarViewMode === 'month') {
        currentViewDate.setMonth(currentViewDate.getMonth() - 1);
      } else if (state.calendarViewMode === 'week') {
        currentViewDate.setDate(currentViewDate.getDate() - 7);
      } else {
        currentViewDate.setDate(currentViewDate.getDate() - 1);
      }
      renderCalendarView();
    });
  }

  // Next navigation
  const nextBtn = document.getElementById('cal-nav-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.calendarViewMode === 'month') {
        currentViewDate.setMonth(currentViewDate.getMonth() + 1);
      } else if (state.calendarViewMode === 'week') {
        currentViewDate.setDate(currentViewDate.getDate() + 7);
      } else {
        currentViewDate.setDate(currentViewDate.getDate() + 1);
      }
      renderCalendarView();
    });
  }

  // Today navigation
  const todayBtn = document.getElementById('cal-nav-today');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      currentViewDate = new Date();
      state.selectedCalendarDate = new Date().toISOString().split('T')[0];
      renderCalendarView();
    });
  }

  // Add Task button
  const addBtn = document.getElementById('btn-calendar-add-task');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      window.openAddTaskModal(state.selectedCalendarDate || new Date().toISOString().split('T')[0]);
    });
  }

  // Cell clicks (date selection or opening add modal)
  document.querySelectorAll('.calendar-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const date = cell.getAttribute('data-date');
      state.selectedCalendarDate = date;
      document.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('cell-selected'));
      cell.classList.add('cell-selected');

      // Double-click or single click opens Add Task
      window.openAddTaskModal(date);
    });
  });

  // Week day column add button
  document.querySelectorAll('.btn-add-day-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const date = btn.getAttribute('data-date');
      window.openAddTaskModal(date);
    });
  });

  // Day view add button
  const dayViewAdd = document.getElementById('btn-day-view-add');
  if (dayViewAdd) {
    dayViewAdd.addEventListener('click', () => {
      const date = dayViewAdd.getAttribute('data-date');
      window.openAddTaskModal(date);
    });
  }

  // Day view task toggle
  document.querySelectorAll('.day-task-card .task-toggle-check').forEach(input => {
    input.addEventListener('change', async (e) => {
      e.stopPropagation();
      const taskId = input.getAttribute('data-id');
      await toggleTaskCompletion(taskId);
    });
  });

  // Day view details button
  document.querySelectorAll('.btn-open-task-details').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-id');
      window.openTaskDetailsModal(taskId);
    });
  });

  // Day view direct delete button
  document.querySelectorAll('.btn-delete-task-direct').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const taskId = btn.getAttribute('data-id');
      if (confirm("Delete this task?")) {
        await deleteTask(taskId);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

