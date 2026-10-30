/**
 * EXAMINATION COUNTDOWN CONTROLLER
 * Live countdown to the Fourth Year Final Examination.
 */

import { state, eventBus } from './state.js';

let intervalId = null;

export function initCountdown() {
  updateCountdown();
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateCountdown, 1000);

  // Re-run countdown when settings change
  eventBus.on('settingsChanged', () => {
    updateCountdown();
  });
}

export function calculateTimeRemaining(targetIsoString) {
  const target = new Date(targetIsoString).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (isNaN(target)) {
    return { isPassed: false, isToday: false, days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 };
  }

  if (diff <= 0) {
    const isToday = Math.abs(diff) < 24 * 60 * 60 * 1000;
    return {
      isPassed: true,
      isToday: isToday,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalMs: diff
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    isPassed: false,
    isToday: false,
    days,
    hours,
    minutes,
    seconds,
    totalMs: diff
  };
}

export function updateCountdown() {
  const examDate = state.settings.examDate || '2027-02-19T09:00:00';
  const time = calculateTimeRemaining(examDate);

  // Update DOM elements across views
  const daysEls = document.querySelectorAll('.exam-days');
  const hoursEls = document.querySelectorAll('.exam-hours');
  const minsEls = document.querySelectorAll('.exam-minutes');
  const secsEls = document.querySelectorAll('.exam-seconds');
  const statusEls = document.querySelectorAll('.exam-status-badge');
  const targetDateEls = document.querySelectorAll('.exam-target-display');

  const formattedDate = new Date(examDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  targetDateEls.forEach(el => {
    el.textContent = formattedDate;
  });

  if (time.isPassed) {
    daysEls.forEach(el => el.textContent = '00');
    hoursEls.forEach(el => el.textContent = '00');
    minsEls.forEach(el => el.textContent = '00');
    secsEls.forEach(el => el.textContent = '00');

    statusEls.forEach(el => {
      if (time.isToday) {
        el.textContent = 'EXAMINATION DAY - BEST OF LUCK!';
        el.className = 'exam-status-badge exam-today';
      } else {
        el.textContent = 'EXAMINATION CONCLUDED';
        el.className = 'exam-status-badge exam-passed';
      }
    });
  } else {
    daysEls.forEach(el => el.textContent = String(time.days).padStart(2, '0'));
    hoursEls.forEach(el => el.textContent = String(time.hours).padStart(2, '0'));
    minsEls.forEach(el => el.textContent = String(time.minutes).padStart(2, '0'));
    secsEls.forEach(el => el.textContent = String(time.seconds).padStart(2, '0'));

    statusEls.forEach(el => {
      el.textContent = 'COUNTDOWN ACTIVE';
      el.className = 'exam-status-badge exam-active';
    });
  }
}

