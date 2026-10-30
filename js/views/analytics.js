/**
 * TOPIC PROGRESSION & ACADEMIC ANALYTICS CONTROLLER
 * Real mathematical insights, streak tracking, study activity Canvas charts,
 * subject comparison bars, and automated diagnostic insights.
 */

import { state, eventBus, getAcademicStats, getSubjectStats, getProductivityAnalytics } from '../state.js';

let chartMode = 'daily'; // 'daily' | 'weekly' | 'cumulative'

export function renderAnalyticsView() {
  const container = document.getElementById('view-analytics');
  if (!container) return;

  const academicStats = getAcademicStats();
  const prodAnalytics = getProductivityAnalytics();

  container.innerHTML = `
    <!-- Top Header -->
    <div class="view-header-flex">
      <div>
        <h1 class="view-main-title">Topic Progression &amp; Analytics</h1>
        <p class="view-subtitle">Data-driven academic performance diagnostics computed directly from your medical database.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary btn-sm" id="btn-refresh-analytics">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          Recalculate
        </button>
      </div>
    </div>

    <!-- Overall Academic Progress Hero Banner -->
    <div class="luxury-card analytics-hero-card">
      <div class="analytics-hero-left">
        <span class="gold-badge-kicker">CURRICULUM COMPLETION</span>
        <h2 class="hero-percent-text">${academicStats.overallCompletionPercentage}%</h2>
        <p class="hero-desc-text">
          You have conquered <strong>${academicStats.completedLectures}</strong> out of <strong>${academicStats.totalLectures}</strong> total fourth-year lectures.
        </p>
        <div class="progress-bar-track progress-bar-lg">
          <div class="progress-bar-fill gold-gradient" style="width: ${academicStats.overallCompletionPercentage}%;"></div>
        </div>
      </div>
      <div class="analytics-hero-right">
        <div class="hero-stat-box">
          <span class="hero-stat-num">${academicStats.completedLectures}</span>
          <span class="hero-stat-label">Completed Lectures</span>
        </div>
        <div class="hero-stat-box">
          <span class="hero-stat-num">${academicStats.remainingLectures}</span>
          <span class="hero-stat-label">Remaining Lectures</span>
        </div>
        <div class="hero-stat-box">
          <span class="hero-stat-num">${academicStats.completedTasks}</span>
          <span class="hero-stat-label">Completed Tasks</span>
        </div>
        <div class="hero-stat-box">
          <span class="hero-stat-num">${academicStats.pendingTasks}</span>
          <span class="hero-stat-label">Pending Tasks</span>
        </div>
      </div>
    </div>

    <!-- Productivity & Streaks Statistics Grid -->
    <div class="productivity-metrics-grid">
      <div class="metric-card luxury-card">
        <div class="metric-icon-wrap icon-gold-metallic">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <div class="metric-data">
          <span class="metric-val gold-text">${prodAnalytics.currentStreak} Days</span>
          <span class="metric-lbl">Current Study Streak</span>
        </div>
      </div>

      <div class="metric-card luxury-card">
        <div class="metric-icon-wrap icon-amber">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
        </div>
        <div class="metric-data">
          <span class="metric-val">${prodAnalytics.longestStreak} Days</span>
          <span class="metric-lbl">Longest Study Streak</span>
        </div>
      </div>

      <div class="metric-card luxury-card">
        <div class="metric-icon-wrap icon-cyan">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div class="metric-data">
          <span class="metric-val">${prodAnalytics.totalActiveDays}</span>
          <span class="metric-lbl">Active Study Days</span>
        </div>
      </div>

      <div class="metric-card luxury-card">
        <div class="metric-icon-wrap icon-blue">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
        </div>
        <div class="metric-data">
          <span class="metric-val">${prodAnalytics.avgDailyTasks}</span>
          <span class="metric-lbl">Avg. Tasks / Active Day</span>
        </div>
      </div>
    </div>

    <!-- Dual Layout: Interactive Study Activity Chart & Academic Insights -->
    <div class="analytics-dual-grid">
      <!-- Left: Study Activity Chart -->
      <div class="luxury-card chart-container-card">
        <div class="chart-header-flex">
          <div>
            <h2 class="card-gold-title">Study Activity &amp; Velocity</h2>
            <p class="chart-subtitle">Calculated strictly from actual timestamped completion records.</p>
          </div>
          <div class="chart-toggle-tabs">
            <button class="chart-toggle-btn ${chartMode === 'daily' ? 'active' : ''}" data-chart="daily">Past 14 Days</button>
            <button class="chart-toggle-btn ${chartMode === 'weekly' ? 'active' : ''}" data-chart="weekly">Weekly</button>
            <button class="chart-toggle-btn ${chartMode === 'cumulative' ? 'active' : ''}" data-chart="cumulative">Cumulative</button>
          </div>
        </div>

        <div class="canvas-wrapper">
          <canvas id="study-activity-canvas" width="600" height="260"></canvas>
        </div>

        <div class="chart-footer-note">
          <span>Most Productive Day: <strong class="gold-text">${prodAnalytics.mostProductiveDay}</strong></span>
          <span>Activity This Week: <strong>${prodAnalytics.completionsThisWeek} completions</strong></span>
        </div>
      </div>

      <!-- Right: Automated Diagnostic Academic Insights -->
      <div class="luxury-card insights-container-card">
        <h2 class="card-gold-title">Academic Insights &amp; Diagnosis</h2>
        <div class="insights-list">
          <div class="insight-item">
            <div class="insight-icon icon-success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <div class="insight-content">
              <span class="insight-title">Most Advanced Subject</span>
              <p class="insight-text">${prodAnalytics.mostAdvanced}</p>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon icon-alert">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <div class="insight-content">
              <span class="insight-title">Least Advanced Subject</span>
              <p class="insight-text">${prodAnalytics.leastAdvanced}</p>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon icon-warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <div class="insight-content">
              <span class="insight-title">Subjects Requiring Attention (&lt;40%)</span>
              <p class="insight-text">
                ${prodAnalytics.subjectsNeedingAttention.length > 0 
                  ? prodAnalytics.subjectsNeedingAttention.join(', ') 
                  : 'All subjects are progressing well above 40%!'}
              </p>
            </div>
          </div>

          <div class="insight-item">
            <div class="insight-icon icon-info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg>
            </div>
            <div class="insight-content">
              <span class="insight-title">Remaining Workload</span>
              <p class="insight-text">${prodAnalytics.remainingWorkload} items remaining (${academicStats.remainingLectures} lectures + ${academicStats.pendingTasks} pending tasks)</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subject Performance Comparison Bars -->
    <div class="luxury-card subject-comparison-card">
      <div class="card-header-flex">
        <div>
          <h2 class="card-gold-title">Subject Performance Comparison</h2>
          <p class="chart-subtitle">Cross-subject completion benchmarks for all fourth-year departments.</p>
        </div>
      </div>

      <div class="subject-comparison-bars">
        ${renderSubjectComparisonBars()}
      </div>
    </div>
  `;

  attachAnalyticsEvents();
  renderActivityChart();
}

function renderSubjectComparisonBars() {
  if (state.subjects.length === 0) {
    return `<p class="empty-hint">No subjects available.</p>`;
  }

  return state.subjects.map(subject => {
    const sStat = getSubjectStats(subject);
    return `
      <div class="comparison-bar-row">
        <div class="comparison-header">
          <span class="comparison-name">${escapeHtml(subject.title)}</span>
          <div class="comparison-nums">
            <span class="comparison-count">${sStat.completedLectures} / ${sStat.totalLectures} lectures (${sStat.remainingLectures} remaining)</span>
            <span class="comparison-pct gold-text"><strong>${sStat.percentage}%</strong></span>
          </div>
        </div>
        <div class="progress-bar-track progress-bar-comparison">
          <div class="progress-bar-fill gold-gradient" style="width: ${sStat.percentage}%;"></div>
        </div>
      </div>
    `;
  }).join('');
}

function renderActivityChart() {
  const canvas = document.getElementById('study-activity-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  // Set real resolution for high-DPI screens
  canvas.width = rect.width * dpr;
  canvas.height = 240 * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 240;

  ctx.clearRect(0, 0, width, height);

  // Prepare chart dataset based on chartMode
  let labels = [];
  let values = [];

  const now = new Date();

  if (chartMode === 'daily') {
    // Past 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const count = countCompletionsOnDate(iso);
      labels.push(d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }));
      values.push(count);
    }
  } else if (chartMode === 'weekly') {
    // Past 6 weeks
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (i * 7 + 6));
      const end = new Date(now);
      end.setDate(end.getDate() - (i * 7));

      let weekCount = 0;
      for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
        weekCount += countCompletionsOnDate(cur.toISOString().split('T')[0]);
      }
      labels.push(`W-${i === 0 ? 'Now' : i}`);
      values.push(weekCount);
    }
  } else {
    // Cumulative lecture completions over past 14 days
    let cumulative = 0;
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      cumulative += countCompletionsOnDate(iso);
      labels.push(d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }));
      values.push(cumulative);
    }
  }

  // Draw Grid Lines & Background
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;

  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...values, 4);

  // Horizontal Grid Lines
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.12)';
  ctx.lineWidth = 1;
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#A0B0C4';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = Math.round((maxVal / gridSteps) * (gridSteps - i));
    const y = paddingTop + (chartH / gridSteps) * i;

    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    ctx.fillText(yVal.toString(), 10, y + 4);
  }

  // Draw Bars or Smooth Line
  const stepX = chartW / (labels.length - 1 || 1);

  if (chartMode === 'daily' || chartMode === 'weekly') {
    // Bar Chart with Metallic Gold Gradients
    const barWidth = Math.min(26, stepX * 0.65);

    values.forEach((val, idx) => {
      const x = paddingLeft + (idx * stepX) - (barWidth / 2);
      const barH = (val / maxVal) * chartH;
      const y = paddingTop + chartH - barH;

      const grad = ctx.createLinearGradient(0, y, 0, paddingTop + chartH);
      grad.addColorStop(0, '#FFE699');
      grad.addColorStop(0.5, '#D4AF37');
      grad.addColorStop(1, '#8B6508');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Top highlight glow
      ctx.strokeStyle = '#FFF8E1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Value label on top of bar if > 0
      if (val > 0) {
        ctx.fillStyle = '#FFEAA7';
        ctx.textAlign = 'center';
        ctx.fillText(val.toString(), x + (barWidth / 2), y - 6);
      }

      // X-axis label
      ctx.fillStyle = '#8FA3BF';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx], x + (barWidth / 2), height - 14);
    });
  } else {
    // Cumulative Smooth Line Chart with Gold Area Glow
    ctx.beginPath();
    const points = [];
    values.forEach((val, idx) => {
      const x = paddingLeft + (idx * stepX);
      const y = paddingTop + chartH - ((val / maxVal) * chartH);
      points.push({ x, y });
    });

    // Area fill
    const areaGrad = ctx.createLinearGradient(0, paddingTop, 0, paddingTop + chartH);
    areaGrad.addColorStop(0, 'rgba(212, 175, 55, 0.4)');
    areaGrad.addColorStop(1, 'rgba(212, 175, 55, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, paddingTop + chartH);
    points.forEach(pt => ctx.lineTo(pt.x, pt.y));
    ctx.lineTo(points[points.length - 1].x, paddingTop + chartH);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    points.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Dots & Labels
    points.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF8E1';
      ctx.fill();
      ctx.strokeStyle = '#8B6508';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#8FA3BF';
      ctx.textAlign = 'center';
      ctx.fillText(labels[idx], pt.x, height - 14);
    });
  }
}

function countCompletionsOnDate(isoDate) {
  let count = 0;
  state.completionHistory.forEach(item => {
    if (item.action === 'completed' && item.timestamp && item.timestamp.startsWith(isoDate)) {
      count++;
    }
  });

  // Also count tasks completed on this date if not duplicated
  state.tasks.forEach(task => {
    if (task.completed && task.completedAt && task.completedAt.startsWith(isoDate)) {
      const inHist = state.completionHistory.some(h => h.itemId === task.id && h.action === 'completed');
      if (!inHist) count++;
    }
  });

  return count;
}

function attachAnalyticsEvents() {
  const refreshBtn = document.getElementById('btn-refresh-analytics');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      renderAnalyticsView();
    });
  }

  document.querySelectorAll('.chart-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chartMode = btn.getAttribute('data-chart');
      document.querySelectorAll('.chart-toggle-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderActivityChart();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

