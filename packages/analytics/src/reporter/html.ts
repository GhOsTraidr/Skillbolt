import type { UsageReport } from '../types/index.js';

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPercentage(value: number): string {
  return (value * 100).toFixed(1) + '%';
}

function formatDuration(ms: number): string {
  if (ms < 1000) return ms.toFixed(0) + 'ms';
  return (ms / 1000).toFixed(2) + 's';
}

export function exportToHTML(report: UsageReport): string {
  const topSkillsRows = report.topSkills
    .map(
      (skill, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${escapeHTML(skill.skillName)}</td>
        <td>${skill.triggers}</td>
        <td>${formatPercentage(skill.successRate)}</td>
        <td>${formatDuration(skill.avgDuration)}</td>
      </tr>
    `
    )
    .join('');

  const unusedSkillsSection =
    report.unusedSkills.length > 0
      ? `
    <section class="unused-skills">
      <h2>Unused Skills</h2>
      <table>
        <thead>
          <tr>
            <th>Skill Name</th>
            <th>Days Since Last Use</th>
            <th>Lifetime Triggers</th>
          </tr>
        </thead>
        <tbody>
          ${report.unusedSkills
            .map(
              (skill) => `
            <tr>
              <td>${escapeHTML(skill.skillName)}</td>
              <td>${skill.daysSinceLastUse === Infinity ? 'Never used' : skill.daysSinceLastUse + ' days'}</td>
              <td>${skill.lifetimeTriggers}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </section>
  `
      : '';

  const suggestionsSection =
    report.suggestions && report.suggestions.length > 0
      ? `
    <section class="suggestions">
      <h2>Optimization Suggestions</h2>
      <div class="suggestion-list">
        ${report.suggestions
          .map(
            (s) => `
          <div class="suggestion priority-${s.priority}">
            <div class="suggestion-header">
              <span class="badge ${s.priority}">${s.priority.toUpperCase()}</span>
              <span class="type">${s.type.replace(/_/g, ' ')}</span>
              <span class="skill">${escapeHTML(s.skillName)}</span>
            </div>
            <p class="reason">${escapeHTML(s.reason)}</p>
            <p class="action">${escapeHTML(s.suggestion)}</p>
          </div>
        `
          )
          .join('')}
      </div>
    </section>
  `
      : '';

  const trendsSection = report.trends
    ? `
    <section class="trends">
      <h2>Trends</h2>
      <div class="trend-cards">
        <div class="trend-card ${report.trends.changes.triggersChange >= 0 ? 'positive' : 'negative'}">
          <div class="trend-label">Triggers</div>
          <div class="trend-value">${report.trends.changes.triggersChange >= 0 ? '+' : ''}${report.trends.changes.triggersChange.toFixed(1)}%</div>
        </div>
        <div class="trend-card ${report.trends.changes.successRateChange >= 0 ? 'positive' : 'negative'}">
          <div class="trend-label">Success Rate</div>
          <div class="trend-value">${report.trends.changes.successRateChange >= 0 ? '+' : ''}${report.trends.changes.successRateChange.toFixed(1)}%</div>
        </div>
        <div class="trend-card ${report.trends.changes.durationChange <= 0 ? 'positive' : 'negative'}">
          <div class="trend-label">Avg Duration</div>
          <div class="trend-value">${report.trends.changes.durationChange >= 0 ? '+' : ''}${report.trends.changes.durationChange.toFixed(1)}%</div>
        </div>
      </div>
    </section>
  `
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Skill Analytics Report</title>
  <style>
    :root {
      --primary: #2563eb;
      --success: #16a34a;
      --warning: #ca8a04;
      --danger: #dc2626;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-700: #374151;
      --gray-900: #111827;
    }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: var(--gray-900);
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: var(--gray-50);
    }
    h1 { color: var(--primary); margin-bottom: 0.5rem; }
    h2 { color: var(--gray-700); border-bottom: 2px solid var(--gray-200); padding-bottom: 0.5rem; }
    .meta { color: var(--gray-700); font-size: 0.9rem; margin-bottom: 2rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-value { font-size: 2rem; font-weight: bold; color: var(--primary); }
    .stat-label { color: var(--gray-700); font-size: 0.9rem; }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    th, td { padding: 1rem; text-align: left; border-bottom: 1px solid var(--gray-200); }
    th { background: var(--gray-100); font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: var(--gray-50); }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.high { background: #fef2f2; color: var(--danger); }
    .badge.medium { background: #fefce8; color: var(--warning); }
    .badge.low { background: #f0fdf4; color: var(--success); }
    .suggestion {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .suggestion-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 0.5rem; }
    .suggestion .type { color: var(--gray-700); }
    .suggestion .skill { font-weight: 600; }
    .suggestion .reason { color: var(--gray-700); margin: 0.5rem 0; }
    .suggestion .action { margin: 0; font-style: italic; }
    .trend-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .trend-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .trend-card.positive .trend-value { color: var(--success); }
    .trend-card.negative .trend-value { color: var(--danger); }
    .trend-value { font-size: 1.5rem; font-weight: bold; }
    .trend-label { color: var(--gray-700); font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <h1>Skill Analytics Report</h1>
    <p class="meta">
      Generated: ${report.meta.generatedAt}<br>
      Period: ${report.meta.startDate} to ${report.meta.endDate} (${report.meta.periodDays} days)
    </p>
  </header>

  <section class="summary">
    <h2>Summary</h2>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${report.meta.totalEvents}</div>
        <div class="stat-label">Total Events</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.statistics.uniqueSkills}</div>
        <div class="stat-label">Unique Skills</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${formatPercentage(report.statistics.overallSuccessRate)}</div>
        <div class="stat-label">Success Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${report.statistics.avgPerDay.toFixed(1)}</div>
        <div class="stat-label">Avg Per Day</div>
      </div>
    </div>
  </section>

  ${trendsSection}

  <section class="top-skills">
    <h2>Top Skills</h2>
    <table>
      <thead>
        <tr>
          <th>Rank</th>
          <th>Skill Name</th>
          <th>Triggers</th>
          <th>Success Rate</th>
          <th>Avg Duration</th>
        </tr>
      </thead>
      <tbody>
        ${topSkillsRows}
      </tbody>
    </table>
  </section>

  ${unusedSkillsSection}
  ${suggestionsSection}

  <footer style="margin-top: 2rem; text-align: center; color: var(--gray-700); font-size: 0.9rem;">
    Generated by @skillbolt/analytics
  </footer>
</body>
</html>`;
}
