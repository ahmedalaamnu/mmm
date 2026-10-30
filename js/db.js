/**
 * DATABASE ACCESS LAYER
 * Real Firebase Firestore integration with automatic seeding, real-time sync,
 * robust error handling, and seamless local fallback.
 */

import { state, eventBus } from './state.js';
import { INITIAL_CURRICULUM } from './initial-curriculum.js';
import { getActiveFirebaseConfig, isFirebaseConfigured } from './firebase-config.js';

// Modular Firebase imports from CDN
let fbApp = null;
let fbAuth = null;
let fbFirestore = null;
let unsubscribers = [];

let isUsingFirestore = false;

export async function initializeDatabase(firebaseApp, authInstance, firestoreInstance) {
  fbApp = firebaseApp;
  fbAuth = authInstance;
  fbFirestore = firestoreInstance;

  if (fbFirestore && state.currentUser && !state.isGuestMode) {
    try {
      isUsingFirestore = true;
      await setupFirestoreSubscriptions(state.currentUser.uid);
      return true;
    } catch (err) {
      console.warn("Firestore subscription failed, falling back to local cache:", err);
      loadFromLocalStorage(state.currentUser.uid);
      return false;
    }
  } else {
    // Guest or offline mode
    const userId = state.currentUser ? state.currentUser.uid : 'guest_student';
    loadFromLocalStorage(userId);
    return true;
  }
}

/**
 * Sets up Firestore real-time listeners for the specific authenticated student.
 */
async function setupFirestoreSubscriptions(uid) {
  // Clear any existing subscriptions
  unsubscribers.forEach(unsub => unsub());
  unsubscribers = [];

  const { doc, collection, onSnapshot, setDoc, getDocs, getDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

  const userDocRef = doc(fbFirestore, 'users', uid);

  // 1. Settings
  const settingsDocRef = doc(fbFirestore, 'users', uid, 'data', 'settings');
  const unsubSettings = onSnapshot(settingsDocRef, (snap) => {
    if (snap.exists()) {
      state.settings = { ...state.settings, ...snap.data() };
    } else {
      // Initialize default settings
      setDoc(settingsDocRef, state.settings, { merge: true });
    }
    eventBus.emit('settingsChanged', state.settings);
  }, (err) => console.error("Settings listener error:", err));
  unsubscribers.push(unsubSettings);

  // 2. Subjects Collection
  const subjectsColRef = collection(fbFirestore, 'users', uid, 'subjects');
  const unsubSubjects = onSnapshot(subjectsColRef, async (snap) => {
    if (snap.empty) {
      // First-time user: Seed initial curriculum into Firestore!
      console.log("Empty subjects collection for user. Seeding initial medical curriculum...");
      await seedInitialCurriculum(uid);
    } else {
      const subjectsList = [];
      snap.forEach(docSnap => {
        subjectsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort subjects by order
      subjectsList.sort((a, b) => (a.order || 0) - (b.order || 0));
      state.subjects = subjectsList;
      saveLocalBackup(uid);
      eventBus.emit('subjectsChanged', state.subjects);
      eventBus.emit('dataChanged');
    }
  }, (err) => console.error("Subjects listener error:", err));
  unsubscribers.push(unsubSubjects);

  // 3. Tasks Collection
  const tasksColRef = collection(fbFirestore, 'users', uid, 'tasks');
  const unsubTasks = onSnapshot(tasksColRef, (snap) => {
    const tasksList = [];
    snap.forEach(docSnap => {
      tasksList.push({ id: docSnap.id, ...docSnap.data() });
    });
    // Sort tasks by date & creation
    tasksList.sort((a, b) => new Date(a.date) - new Date(b.date));
    state.tasks = tasksList;
    saveLocalBackup(uid);
    eventBus.emit('tasksChanged', state.tasks);
    eventBus.emit('dataChanged');
  }, (err) => console.error("Tasks listener error:", err));
  unsubscribers.push(unsubTasks);

  // 4. Completion History Collection
  const historyColRef = collection(fbFirestore, 'users', uid, 'completionHistory');
  const unsubHistory = onSnapshot(historyColRef, (snap) => {
    const historyList = [];
    snap.forEach(docSnap => {
      historyList.push({ id: docSnap.id, ...docSnap.data() });
    });
    historyList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    state.completionHistory = historyList;
    saveLocalBackup(uid);
    eventBus.emit('historyChanged', state.completionHistory);
    eventBus.emit('dataChanged');
  }, (err) => console.error("History listener error:", err));
  unsubscribers.push(unsubHistory);
}

/**
 * Seeds initial 5 medical subjects with all branches & lectures into Firestore.
 */
async function seedInitialCurriculum(uid) {
  if (!fbFirestore) return;
  const { doc, writeBatch } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
  const batch = writeBatch(fbFirestore);

  INITIAL_CURRICULUM.forEach(subject => {
    const ref = doc(fbFirestore, 'users', uid, 'subjects', subject.id);
    batch.set(ref, subject);
  });

  await batch.commit();
  console.log("Initial medical curriculum seeded successfully.");
}

// ---------------- LOCAL STORAGE FALLBACK & OFFLINE CACHE ---------------- //

function getStoragePrefix(uid) {
  return `rabia_tib_${uid || 'guest'}_`;
}

function loadFromLocalStorage(uid) {
  const prefix = getStoragePrefix(uid);
  try {
    const rawSubjects = localStorage.getItem(prefix + 'subjects');
    if (rawSubjects) {
      state.subjects = JSON.parse(rawSubjects);
    } else {
      // Seed locally
      state.subjects = JSON.parse(JSON.stringify(INITIAL_CURRICULUM));
      localStorage.setItem(prefix + 'subjects', JSON.stringify(state.subjects));
    }

    const rawTasks = localStorage.getItem(prefix + 'tasks');
    state.tasks = rawTasks ? JSON.parse(rawTasks) : [];

    const rawSettings = localStorage.getItem(prefix + 'settings');
    if (rawSettings) {
      state.settings = { ...state.settings, ...JSON.parse(rawSettings) };
    }

    const rawHistory = localStorage.getItem(prefix + 'history');
    state.completionHistory = rawHistory ? JSON.parse(rawHistory) : [];

    eventBus.emit('subjectsChanged', state.subjects);
    eventBus.emit('tasksChanged', state.tasks);
    eventBus.emit('settingsChanged', state.settings);
    eventBus.emit('historyChanged', state.completionHistory);
    eventBus.emit('dataChanged');
  } catch (err) {
    console.error("Failed to load data from localStorage", err);
    state.subjects = JSON.parse(JSON.stringify(INITIAL_CURRICULUM));
  }
}

function saveLocalBackup(uid) {
  const prefix = getStoragePrefix(uid);
  try {
    localStorage.setItem(prefix + 'subjects', JSON.stringify(state.subjects));
    localStorage.setItem(prefix + 'tasks', JSON.stringify(state.tasks));
    localStorage.setItem(prefix + 'settings', JSON.stringify(state.settings));
    localStorage.setItem(prefix + 'history', JSON.stringify(state.completionHistory));
  } catch (err) {
    console.warn("Could not write backup to localStorage:", err);
  }
}

// ---------------- CRUD OPERATIONS ---------------- //

export async function saveExamDate(newDateIso) {
  state.settings.examDate = newDateIso;
  eventBus.emit('settingsChanged', state.settings);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'data', 'settings');
    await setDoc(ref, { examDate: newDateIso }, { merge: true });
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }
}

// LECTURE COMPLETION TOGGLE
export async function toggleLectureCompletion(subjectId, branchId, lectureId, completedNotes = '') {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = (subject.branches || []).find(b => b.id === branchId);
  if (!branch) return;
  const lecture = (branch.lectures || []).find(l => l.id === lectureId);
  if (!lecture) return;

  const now = new Date().toISOString();
  lecture.completed = !lecture.completed;
  lecture.completedAt = lecture.completed ? now : null;
  if (completedNotes) {
    lecture.notes = completedNotes;
  }

  // Record history
  const historyItem = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'lecture',
    itemId: lecture.id,
    itemTitle: lecture.title,
    subjectId: subject.id,
    subjectTitle: subject.title,
    timestamp: now,
    action: lecture.completed ? 'completed' : 'uncompleted'
  };

  state.completionHistory.unshift(historyItem);

  // Sync to database
  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const subjRef = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(subjRef, subject);

    const histRef = doc(fbFirestore, 'users', state.currentUser.uid, 'completionHistory', historyItem.id);
    await setDoc(histRef, historyItem);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('historyChanged', state.completionHistory);
  eventBus.emit('dataChanged');
}

// UPDATE LECTURE NOTES
export async function updateLectureNotes(subjectId, branchId, lectureId, notes) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = (subject.branches || []).find(b => b.id === branchId);
  if (!branch) return;
  const lecture = (branch.lectures || []).find(l => l.id === lectureId);
  if (!lecture) return;

  lecture.notes = notes;

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const subjRef = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(subjRef, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

// SUBJECT CRUD
export async function addSubject(title) {
  const newSubject = {
    id: `subj_${Date.now()}`,
    title: title.trim(),
    order: state.subjects.length + 1,
    branches: []
  };

  state.subjects.push(newSubject);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', newSubject.id);
    await setDoc(ref, newSubject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
  return newSubject;
}

export async function editSubject(subjectId, newTitle) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  subject.title = newTitle.trim();

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

export async function deleteSubject(subjectId) {
  state.subjects = state.subjects.filter(s => s.id !== subjectId);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subjectId);
    await deleteDoc(ref);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

// BRANCH CRUD
export async function addBranch(subjectId, branchTitle) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  const newBranch = {
    id: `branch_${Date.now()}`,
    title: branchTitle.trim(),
    lectures: []
  };

  subject.branches.push(newBranch);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
  return newBranch;
}

export async function editBranch(subjectId, branchId, newTitle) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = subject.branches.find(b => b.id === branchId);
  if (!branch) return;

  branch.title = newTitle.trim();

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

export async function deleteBranch(subjectId, branchId) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;

  subject.branches = subject.branches.filter(b => b.id !== branchId);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

// LECTURE CRUD
export async function addLecture(subjectId, branchId, lectureTitle) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = subject.branches.find(b => b.id === branchId);
  if (!branch) return;

  const newLecture = {
    id: `lec_${Date.now()}`,
    title: lectureTitle.trim(),
    completed: false,
    completedAt: null,
    notes: ''
  };

  branch.lectures.push(newLecture);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
  return newLecture;
}

export async function editLecture(subjectId, branchId, lectureId, newTitle) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = subject.branches.find(b => b.id === branchId);
  if (!branch) return;
  const lecture = branch.lectures.find(l => l.id === lectureId);
  if (!lecture) return;

  lecture.title = newTitle.trim();

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

export async function deleteLecture(subjectId, branchId, lectureId) {
  const subject = state.subjects.find(s => s.id === subjectId);
  if (!subject) return;
  const branch = subject.branches.find(b => b.id === branchId);
  if (!branch) return;

  branch.lectures = branch.lectures.filter(l => l.id !== lectureId);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', subject.id);
    await setDoc(ref, subject);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

// TASK CRUD
export async function addTask(taskData) {
  const newTask = {
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    title: taskData.title.trim(),
    date: taskData.date, // 'YYYY-MM-DD'
    subjectId: taskData.subjectId || null,
    branchId: taskData.branchId || null,
    lectureId: taskData.lectureId || null,
    description: taskData.description ? taskData.description.trim() : '',
    completed: false,
    completedAt: null,
    createdAt: new Date().toISOString()
  };

  state.tasks.push(newTask);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'tasks', newTask.id);
    await setDoc(ref, newTask);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('tasksChanged', state.tasks);
  eventBus.emit('dataChanged');
  return newTask;
}

export async function updateTask(taskId, updates) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  Object.assign(task, updates);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'tasks', task.id);
    await setDoc(ref, task);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('tasksChanged', state.tasks);
  eventBus.emit('dataChanged');
}

export async function toggleTaskCompletion(taskId) {
  const task = state.tasks.find(t => t.id === taskId);
  if (!task) return;

  const now = new Date().toISOString();
  task.completed = !task.completed;
  task.completedAt = task.completed ? now : null;

  // Add completion history entry
  const historyItem = {
    id: `hist_t_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    type: 'task',
    itemId: task.id,
    itemTitle: task.title,
    subjectId: task.subjectId || null,
    timestamp: now,
    action: task.completed ? 'completed' : 'uncompleted'
  };

  state.completionHistory.unshift(historyItem);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const taskRef = doc(fbFirestore, 'users', state.currentUser.uid, 'tasks', task.id);
    await setDoc(taskRef, task);

    const histRef = doc(fbFirestore, 'users', state.currentUser.uid, 'completionHistory', historyItem.id);
    await setDoc(histRef, historyItem);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('tasksChanged', state.tasks);
  eventBus.emit('historyChanged', state.completionHistory);
  eventBus.emit('dataChanged');
}

export async function deleteTask(taskId) {
  state.tasks = state.tasks.filter(t => t.id !== taskId);

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const ref = doc(fbFirestore, 'users', state.currentUser.uid, 'tasks', taskId);
    await deleteDoc(ref);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('tasksChanged', state.tasks);
  eventBus.emit('dataChanged');
}

// ---------------- EXPORT & BACKUP RESTORE ---------------- //

export function exportUserData() {
  const backupData = {
    appName: "رابعة طب",
    version: "1.0",
    exportedAt: new Date().toISOString(),
    user: {
      email: state.currentUser ? state.currentUser.email : 'guest@student',
      name: state.currentUser ? state.currentUser.displayName : 'Medical Student'
    },
    settings: state.settings,
    subjects: state.subjects,
    tasks: state.tasks,
    completionHistory: state.completionHistory
  };

  const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", `Rabia_Tib_Backup_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export async function importUserData(jsonString) {
  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (err) {
    throw new Error("Invalid JSON file format.");
  }

  if (!data || !Array.isArray(data.subjects)) {
    throw new Error("Invalid backup structure: subjects data missing.");
  }

  state.subjects = data.subjects;
  if (Array.isArray(data.tasks)) state.tasks = data.tasks;
  if (data.settings && data.settings.examDate) state.settings = data.settings;
  if (Array.isArray(data.completionHistory)) state.completionHistory = data.completionHistory;

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    const { doc, writeBatch, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
    const batch = writeBatch(fbFirestore);

    // Write settings
    const settingsRef = doc(fbFirestore, 'users', state.currentUser.uid, 'data', 'settings');
    batch.set(settingsRef, state.settings);

    // Overwrite subjects
    state.subjects.forEach(s => {
      const sRef = doc(fbFirestore, 'users', state.currentUser.uid, 'subjects', s.id);
      batch.set(sRef, s);
    });

    // Overwrite tasks
    state.tasks.forEach(t => {
      const tRef = doc(fbFirestore, 'users', state.currentUser.uid, 'tasks', t.id);
      batch.set(tRef, t);
    });

    await batch.commit();
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('tasksChanged', state.tasks);
  eventBus.emit('settingsChanged', state.settings);
  eventBus.emit('historyChanged', state.completionHistory);
  eventBus.emit('dataChanged');
}

export async function resetCurriculumToDefault() {
  state.subjects = JSON.parse(JSON.stringify(INITIAL_CURRICULUM));

  if (isUsingFirestore && fbFirestore && state.currentUser) {
    await seedInitialCurriculum(state.currentUser.uid);
  } else {
    saveLocalBackup(state.currentUser ? state.currentUser.uid : 'guest');
  }

  eventBus.emit('subjectsChanged', state.subjects);
  eventBus.emit('dataChanged');
}

