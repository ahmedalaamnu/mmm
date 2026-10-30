/**
 * SUBJECTS & LECTURE MANAGEMENT CONTROLLER
 * Full hierarchy: Subject -> Branch -> Lectures with completion toggling,
 * CRUD operations, notes, search filtering, and confirmation modals.
 */

import { state, eventBus, getSubjectStats } from '../state.js';
import { 
  addSubject, editSubject, deleteSubject,
  addBranch, editBranch, deleteBranch,
  addLecture, editLecture, deleteLecture,
  toggleLectureCompletion, updateLectureNotes 
} from '../db.js';

let searchQuery = '';
let expandedBranches = new Set();

export function renderSubjectsView() {
  const container = document.getElementById('view-subjects');
  if (!container) return;

  if (state.subjects.length === 0) {
    container.innerHTML = `
      <div class="luxury-card text-center" style="padding: 3rem;">
        <h2 class="card-gold-title">No Subjects Configured</h2>
        <p class="text-muted" style="margin: 1rem 0 1.5rem;">Initialize the default medical curriculum or add your first subject.</p>
        <button class="btn btn-gold" id="btn-seed-curriculum">Load Initial Medical Curriculum</button>
      </div>
    `;
    const seedBtn = container.querySelector('#btn-seed-curriculum');
    if (seedBtn) {
      seedBtn.addEventListener('click', async () => {
        const { resetCurriculumToDefault } = await import('../db.js');
        await resetCurriculumToDefault();
      });
    }
    return;
  }

  // Ensure an active subject is selected
  if (!state.selectedSubjectId || !state.subjects.some(s => s.id === state.selectedSubjectId)) {
    state.selectedSubjectId = state.subjects[0].id;
  }

  const activeSubject = state.subjects.find(s => s.id === state.selectedSubjectId) || state.subjects[0];
  const subjectStats = getSubjectStats(activeSubject);

  // Initialize expanded branches to all by default if empty
  if (expandedBranches.size === 0 && activeSubject.branches) {
    activeSubject.branches.forEach(b => expandedBranches.add(b.id));
  }

  container.innerHTML = `
    <!-- Top Action Header -->
    <div class="view-header-flex">
      <div>
        <h1 class="view-main-title">Subjects &amp; Lecture Management</h1>
        <p class="view-subtitle">Select a subject to inspect branches, check off lectures, or organize your curriculum.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-gold" id="btn-add-subject-modal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add Subject
        </button>
      </div>
    </div>

    <!-- Subject Tabs Navigation Strip -->
    <div class="subject-tabs-scroll">
      ${state.subjects.map(s => {
        const sStat = getSubjectStats(s);
        const isActive = s.id === activeSubject.id;
        return `
          <button class="subject-tab-btn ${isActive ? 'active' : ''}" data-subject-id="${s.id}">
            <span class="tab-title">${escapeHtml(s.title)}</span>
            <span class="tab-badge">${sStat.completedLectures}/${sStat.totalLectures} &bull; ${sStat.percentage}%</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- Active Subject Detail Card -->
    <div class="luxury-card subject-active-card">
      <div class="subject-card-header">
        <div class="subject-title-area">
          <span class="subject-kicker">Subject Overview</span>
          <h2 class="active-subject-name">${escapeHtml(activeSubject.title)}</h2>
        </div>
        <div class="subject-management-buttons">
          <button class="btn btn-sm btn-secondary" id="btn-edit-active-subject" title="Rename Subject">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            Rename
          </button>
          <button class="btn btn-sm btn-danger" id="btn-delete-active-subject" title="Delete Subject">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Delete
          </button>
          <button class="btn btn-sm btn-gold" id="btn-add-branch-modal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Branch
          </button>
        </div>
      </div>

      <!-- Subject Progress Stats -->
      <div class="subject-progress-container">
        <div class="progress-meta-flex">
          <div class="progress-item">
            <span class="meta-label">Completion Status</span>
            <span class="meta-val gold-text"><strong>${subjectStats.percentage}% Complete</strong></span>
          </div>
          <div class="progress-item">
            <span class="meta-label">Completed Lectures</span>
            <span class="meta-val">${subjectStats.completedLectures} / ${subjectStats.totalLectures}</span>
          </div>
          <div class="progress-item">
            <span class="meta-label">Remaining Lectures</span>
            <span class="meta-val">${subjectStats.remainingLectures}</span>
          </div>
          <div class="progress-item">
            <span class="meta-label">Total Branches</span>
            <span class="meta-val">${(activeSubject.branches || []).length}</span>
          </div>
        </div>
        <div class="progress-bar-track progress-bar-lg">
          <div class="progress-bar-fill gold-gradient" style="width: ${subjectStats.percentage}%;"></div>
        </div>
      </div>

      <!-- Search & Branch Filter Toolbar -->
      <div class="curriculum-toolbar">
        <div class="search-input-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="lecture-search-input" placeholder="Search lectures in ${escapeHtml(activeSubject.title)}..." value="${escapeHtml(searchQuery)}">
          ${searchQuery ? `<button class="clear-search-btn" id="btn-clear-search">&times;</button>` : ''}
        </div>
        <div class="toolbar-branch-controls">
          <button class="btn btn-xs btn-ghost" id="btn-expand-all-branches">Expand All</button>
          <button class="btn btn-xs btn-ghost" id="btn-collapse-all-branches">Collapse All</button>
        </div>
      </div>

      <!-- Branches & Lectures Tree Container -->
      <div class="branches-container" id="branches-list-wrap">
        ${renderBranches(activeSubject)}
      </div>
    </div>
  `;

  attachSubjectEvents(activeSubject);
}

function renderBranches(subject) {
  const branches = subject.branches || [];

  if (branches.length === 0) {
    return `
      <div class="empty-state-card">
        <p>No branches in this subject yet.</p>
        <button class="btn btn-sm btn-gold" id="btn-empty-add-branch">Create First Branch</button>
      </div>
    `;
  }

  const query = searchQuery.trim().toLowerCase();

  return branches.map((branch, bIdx) => {
    let lectures = branch.lectures || [];
    if (query) {
      lectures = lectures.filter(l => l.title.toLowerCase().includes(query));
    }

    // Branch stats
    const totalLec = (branch.lectures || []).length;
    const completedLec = (branch.lectures || []).filter(l => l.completed).length;
    const bPercent = totalLec > 0 ? Math.round((completedLec / totalLec) * 100) : 0;
    const isExpanded = expandedBranches.has(branch.id);

    return `
      <div class="branch-accordion ${isExpanded ? 'open' : ''}" data-branch-id="${branch.id}">
        <div class="branch-header" data-branch-toggle="${branch.id}">
          <div class="branch-header-left">
            <span class="accordion-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </span>
            <div class="branch-title-wrap">
              <span class="branch-order-label">Branch ${bIdx + 1}</span>
              <h3 class="branch-name">${escapeHtml(branch.title)}</h3>
            </div>
          </div>

          <div class="branch-header-right">
            <span class="branch-badge ${bPercent === 100 ? 'badge-complete' : ''}">
              ${completedLec} / ${totalLec} (${bPercent}%)
            </span>
            <div class="branch-actions-wrap" onclick="event.stopPropagation();">
              <button class="btn-icon-xs btn-add-lecture-to-branch" data-branch-id="${branch.id}" title="Add Lecture to this branch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              </button>
              <button class="btn-icon-xs btn-edit-branch" data-branch-id="${branch.id}" data-branch-title="${escapeHtml(branch.title)}" title="Rename Branch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button class="btn-icon-xs btn-delete-branch text-danger" data-branch-id="${branch.id}" data-branch-title="${escapeHtml(branch.title)}" title="Delete Branch">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Lectures List under Branch -->
        <div class="branch-content" style="${isExpanded ? 'display: block;' : 'display: none;'}">
          ${lectures.length === 0 ? `
            <div class="empty-branch-hint">
              ${query ? 'No lectures match your search filter.' : 'No lectures in this branch yet.'}
            </div>
          ` : `
            <div class="lectures-list">
              ${lectures.map((lecture, lIdx) => `
                <div class="lecture-item-row ${lecture.completed ? 'lecture-completed' : ''}" data-lecture-id="${lecture.id}">
                  <div class="lecture-left">
                    <label class="custom-checkbox">
                      <input type="checkbox" 
                             class="lecture-check-toggle" 
                             data-subject-id="${subject.id}" 
                             data-branch-id="${branch.id}" 
                             data-lecture-id="${lecture.id}" 
                             ${lecture.completed ? 'checked' : ''}>
                      <span class="checkmark"></span>
                    </label>
                    <div class="lecture-text-wrap">
                      <span class="lecture-number">${lIdx + 1}.</span>
                      <span class="lecture-title ${lecture.completed ? 'text-strikethrough' : ''}">${escapeHtml(lecture.title)}</span>
                    </div>
                  </div>

                  <div class="lecture-right">
                    ${lecture.completed && lecture.completedAt ? `
                      <span class="completion-date-pill" title="Completed on ${new Date(lecture.completedAt).toLocaleString()}">
                        Completed: ${new Date(lecture.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    ` : ''}

                    <button class="btn-icon-xs btn-lecture-notes ${lecture.notes ? 'has-notes' : ''}" 
                            data-subject-id="${subject.id}"
                            data-branch-id="${branch.id}"
                            data-lecture-id="${lecture.id}"
                            data-lecture-title="${escapeHtml(lecture.title)}"
                            title="${lecture.notes ? 'View/Edit Notes (Has Notes)' : 'Add Study Notes'}">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </button>

                    <button class="btn-icon-xs btn-edit-lecture" 
                            data-subject-id="${subject.id}"
                            data-branch-id="${branch.id}"
                            data-lecture-id="${lecture.id}"
                            data-lecture-title="${escapeHtml(lecture.title)}"
                            title="Rename Lecture">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>

                    <button class="btn-icon-xs btn-delete-lecture text-danger" 
                            data-subject-id="${subject.id}"
                            data-branch-id="${branch.id}"
                            data-lecture-id="${lecture.id}"
                            data-lecture-title="${escapeHtml(lecture.title)}"
                            title="Delete Lecture">
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
  }).join('');
}

function attachSubjectEvents(activeSubject) {
  // Tab switching
  document.querySelectorAll('.subject-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.getAttribute('data-subject-id');
      state.selectedSubjectId = sId;
      searchQuery = '';
      expandedBranches.clear();
      renderSubjectsView();
    });
  });

  // Search input
  const searchInput = document.getElementById('lecture-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      const wrap = document.getElementById('branches-list-wrap');
      if (wrap) wrap.innerHTML = renderBranches(activeSubject);
      attachBranchAndLectureEvents(activeSubject);
    });
  }

  const clearSearch = document.getElementById('btn-clear-search');
  if (clearSearch) {
    clearSearch.addEventListener('click', () => {
      searchQuery = '';
      renderSubjectsView();
    });
  }

  // Expand / collapse all
  const expandAll = document.getElementById('btn-expand-all-branches');
  if (expandAll) {
    expandAll.addEventListener('click', () => {
      (activeSubject.branches || []).forEach(b => expandedBranches.add(b.id));
      renderSubjectsView();
    });
  }

  const collapseAll = document.getElementById('btn-collapse-all-branches');
  if (collapseAll) {
    collapseAll.addEventListener('click', () => {
      expandedBranches.clear();
      renderSubjectsView();
    });
  }

  // Subject Actions
  const addSubBtn = document.getElementById('btn-add-subject-modal');
  if (addSubBtn) {
    addSubBtn.addEventListener('click', () => {
      const title = prompt("Enter new subject title:");
      if (title && title.trim()) {
        addSubject(title.trim()).then(newSub => {
          state.selectedSubjectId = newSub.id;
        });
      }
    });
  }

  const editSubBtn = document.getElementById('btn-edit-active-subject');
  if (editSubBtn) {
    editSubBtn.addEventListener('click', () => {
      const newTitle = prompt("Enter new subject name:", activeSubject.title);
      if (newTitle && newTitle.trim()) {
        editSubject(activeSubject.id, newTitle.trim());
      }
    });
  }

  const deleteSubBtn = document.getElementById('btn-delete-active-subject');
  if (deleteSubBtn) {
    deleteSubBtn.addEventListener('click', () => {
      const confirmed = confirm(`Are you sure you want to delete the subject "${activeSubject.title}" and all its branches and lectures?\n\nThis action cannot be undone.`);
      if (confirmed) {
        deleteSubject(activeSubject.id).then(() => {
          state.selectedSubjectId = state.subjects.length > 0 ? state.subjects[0].id : null;
        });
      }
    });
  }

  const addBranchBtn = document.getElementById('btn-add-branch-modal');
  if (addBranchBtn) {
    addBranchBtn.addEventListener('click', () => {
      const title = prompt(`Enter new branch title for ${activeSubject.title}:`);
      if (title && title.trim()) {
        addBranch(activeSubject.id, title.trim()).then(newBranch => {
          expandedBranches.add(newBranch.id);
        });
      }
    });
  }

  const emptyAddBranch = document.getElementById('btn-empty-add-branch');
  if (emptyAddBranch) {
    emptyAddBranch.addEventListener('click', () => {
      if (addBranchBtn) addBranchBtn.click();
    });
  }

  attachBranchAndLectureEvents(activeSubject);
}

function attachBranchAndLectureEvents(activeSubject) {
  // Accordion toggle
  document.querySelectorAll('[data-branch-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const branchId = header.getAttribute('data-branch-toggle');
      if (expandedBranches.has(branchId)) {
        expandedBranches.delete(branchId);
      } else {
        expandedBranches.add(branchId);
      }
      renderSubjectsView();
    });
  });

  // Branch CRUD
  document.querySelectorAll('.btn-add-lecture-to-branch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const branchId = btn.getAttribute('data-branch-id');
      const title = prompt("Enter lecture title:");
      if (title && title.trim()) {
        addLecture(activeSubject.id, branchId, title.trim());
      }
    });
  });

  document.querySelectorAll('.btn-edit-branch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const branchId = btn.getAttribute('data-branch-id');
      const oldTitle = btn.getAttribute('data-branch-title');
      const newTitle = prompt("Rename branch:", oldTitle);
      if (newTitle && newTitle.trim()) {
        editBranch(activeSubject.id, branchId, newTitle.trim());
      }
    });
  });

  document.querySelectorAll('.btn-delete-branch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const branchId = btn.getAttribute('data-branch-id');
      const oldTitle = btn.getAttribute('data-branch-title');
      const confirmed = confirm(`Are you sure you want to delete branch "${oldTitle}" and its lectures?`);
      if (confirmed) {
        deleteBranch(activeSubject.id, branchId);
      }
    });
  });

  // Lecture Completion Checkbox Toggle (Immediately recalculates dashboard & progress)
  document.querySelectorAll('.lecture-check-toggle').forEach(input => {
    input.addEventListener('change', async (e) => {
      const subjectId = input.getAttribute('data-subject-id');
      const branchId = input.getAttribute('data-branch-id');
      const lectureId = input.getAttribute('data-lecture-id');

      await toggleLectureCompletion(subjectId, branchId, lectureId);
    });
  });

  // Lecture Notes Modal
  document.querySelectorAll('.btn-lecture-notes').forEach(btn => {
    btn.addEventListener('click', () => {
      const subjectId = btn.getAttribute('data-subject-id');
      const branchId = btn.getAttribute('data-branch-id');
      const lectureId = btn.getAttribute('data-lecture-id');
      const lectureTitle = btn.getAttribute('data-lecture-title');

      const subject = state.subjects.find(s => s.id === subjectId);
      const branch = subject ? subject.branches.find(b => b.id === branchId) : null;
      const lecture = branch ? branch.lectures.find(l => l.id === lectureId) : null;

      window.openLectureNotesModal(subjectId, branchId, lectureId, lectureTitle, lecture ? lecture.notes : '');
    });
  });

  // Lecture Rename
  document.querySelectorAll('.btn-edit-lecture').forEach(btn => {
    btn.addEventListener('click', () => {
      const subjectId = btn.getAttribute('data-subject-id');
      const branchId = btn.getAttribute('data-branch-id');
      const lectureId = btn.getAttribute('data-lecture-id');
      const oldTitle = btn.getAttribute('data-lecture-title');

      const newTitle = prompt("Rename lecture:", oldTitle);
      if (newTitle && newTitle.trim()) {
        editLecture(subjectId, branchId, lectureId, newTitle.trim());
      }
    });
  });

  // Lecture Delete
  document.querySelectorAll('.btn-delete-lecture').forEach(btn => {
    btn.addEventListener('click', () => {
      const subjectId = btn.getAttribute('data-subject-id');
      const branchId = btn.getAttribute('data-branch-id');
      const lectureId = btn.getAttribute('data-lecture-id');
      const title = btn.getAttribute('data-lecture-title');

      const confirmed = confirm(`Are you sure you want to delete lecture "${title}"?`);
      if (confirmed) {
        deleteLecture(subjectId, branchId, lectureId);
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

