/**
 * CENTRALIZED APPLICATION STATE & ANALYTICS CALCULATOR
 * Manages reactive state, dynamic statistics calculations, and event dispatching.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in event listener for ${event}:`, err);
        }
      });
    }
  }
}

export const eventBus = new EventBus();

export const state = {
  currentUser: null,
  isAuthReady: false,
  isGuestMode: false,
  settings: {
    examDate: '2027-02-19T09:00:00'
  },
  subjects: [],
  tasks: [],
  completionHistory: [],
  activeView: 'dashboard',
  selectedSubjectId: null,
  selectedCalendarDate: new Date().toISOString().split('T')[0],
  calendarViewMode: 'month', // 'month' | 'week' | 'day'
  calendarCurrentMonth: new Date()
};

/**
 * Calculates academic statistics strictly from actual database data.
 * Zero hardcoded or estimated numbers.
 */
export function getAcademicStats() {
  let totalLectures = 0;
  let completedLectures = 0;

  state.subjects.forEach(subject => {
    (subject.branches || []).forEach(branch => {
      (branch.lectures || []).forEach(lecture => {
        totalLectures++;
        if (lecture.completed) {
          completedLectures++;
        }
      });
    });
  });

  const remainingLectures = totalLectures - completedLectures;
  const overallCompletionPercentage = totalLectures > 0 
    ? Math.round((completedLectures / totalLectures) * 100) 
    : 0;

  // Task stats
  const totalTasks = state.tasks.length;
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Today stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = state.tasks.filter(t => t.date === todayStr);
  const todayCompleted = todayTasks.filter(t => t.completed).length;
  const todayRemaining = todayTasks.length - todayCompleted;
  const todayPercentage = todayTasks.length > 0 
    ? Math.round((todayCompleted / todayTasks.length) * 100) 
    : 0;

  return {
    totalSubjects: state.subjects.length,
    totalLectures,
    completedLectures,
    remainingLectures,
    overallCompletionPercentage,
    totalTasks,
    completedTasks,
    pendingTasks,
    todayTotal: todayTasks.length,
    todayCompleted,
    todayRemaining,
    todayPercentage
  };
}

/**
 * Calculates individual statistics for a subject.
 */
export function getSubjectStats(subject) {
  let totalLectures = 0;
  let completedLectures = 0;

  (subject.branches || []).forEach(branch => {
    (branch.lectures || []).forEach(lecture => {
      totalLectures++;
      if (lecture.completed) {
        completedLectures++;
      }
    });
  });

  const remainingLectures = totalLectures - completedLectures;
  const percentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

  return {
    totalLectures,
    completedLectures,
    remainingLectures,
    percentage
  };
}

/**
 * Calculates productivity analytics and streaks from actual timestamped history.
 */
export function getProductivityAnalytics() {
  // Aggregate completions by date
  const completionsByDate = {};
  
  // From completionHistory
  state.completionHistory.forEach(item => {
    if (item.action === 'completed' && item.timestamp) {
      const dateKey = item.timestamp.split('T')[0];
      completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
    }
  });

  // Also include completed tasks timestamps
  state.tasks.forEach(task => {
    if (task.completed && task.completedAt) {
      const dateKey = task.completedAt.split('T')[0];
      // Only count if not already logged in completionHistory
      const inHistory = state.completionHistory.some(h => h.itemId === task.id && h.action === 'completed');
      if (!inHistory) {
        completionsByDate[dateKey] = (completionsByDate[dateKey] || 0) + 1;
      }
    }
  });

  const activeDates = Object.keys(completionsByDate).sort();
  const totalActiveDays = activeDates.length;

  // Most productive day
  let mostProductiveDay = 'None yet';
  let maxCompletions = 0;
  for (const [dateStr, count] of Object.entries(completionsByDate)) {
    if (count > maxCompletions) {
      maxCompletions = count;
      const d = new Date(dateStr);
      mostProductiveDay = `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} (${count} items)`;
    }
  }

  // Calculate study streaks based on active dates
  let currentStreak = 0;
  let longestStreak = 0;

  if (activeDates.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = today.toISOString().split('T')[0];
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // Check if streak is alive (activity today or yesterday)
    let checkDate = new Date(today);
    if (!completionsByDate[todayKey] && completionsByDate[yesterdayKey]) {
      checkDate = new Date(yesterday);
    }

    if (completionsByDate[checkDate.toISOString().split('T')[0]]) {
      while (true) {
        const key = checkDate.toISOString().split('T')[0];
        if (completionsByDate[key]) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Longest streak calculation
    let tempStreak = 0;
    for (let i = 0; i < activeDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(activeDates[i - 1]);
        const curr = new Date(activeDates[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }
  }

  // Average daily tasks
  const completedTaskCount = state.tasks.filter(t => t.completed).length;
  const avgDailyTasks = totalActiveDays > 0 ? (completedTaskCount / totalActiveDays).toFixed(1) : '0.0';

  // Academic insights
  const subjectStatsList = state.subjects.map(s => ({
    subject: s,
    stats: getSubjectStats(s)
  })).filter(item => item.stats.totalLectures > 0);

  let mostAdvanced = null;
  let leastAdvanced = null;

  if (subjectStatsList.length > 0) {
    const sorted = [...subjectStatsList].sort((a, b) => b.stats.percentage - a.stats.percentage);
    mostAdvanced = sorted[0];
    leastAdvanced = sorted[sorted.length - 1];
  }

  // Activity this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  let completionsThisWeek = 0;
  for (const [dateStr, count] of Object.entries(completionsByDate)) {
    if (new Date(dateStr) >= oneWeekAgo) {
      completionsThisWeek += count;
    }
  }

  const academicOverview = getAcademicStats();

  return {
    activeDates,
    totalActiveDays,
    mostProductiveDay,
    currentStreak,
    longestStreak,
    avgDailyTasks,
    mostAdvanced: mostAdvanced ? `${mostAdvanced.subject.title} (${mostAdvanced.stats.percentage}%)` : 'Not enough data',
    leastAdvanced: leastAdvanced ? `${leastAdvanced.subject.title} (${leastAdvanced.stats.percentage}%)` : 'Not enough data',
    subjectsNeedingAttention: subjectStatsList
      .filter(item => item.stats.percentage < 40)
      .map(item => item.subject.title),
    completionsThisWeek,
    remainingWorkload: academicOverview.remainingLectures + academicOverview.pendingTasks,
    completionsByDate
  };
}

