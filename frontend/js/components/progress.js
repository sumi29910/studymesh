import { escapeHtml } from './dashboard.js'
import { renderDonutChart, renderBarChart } from './charts.js'

const SUBJECT_COLORS = {
  Physics: 'var(--marker-blue)',
  CS: 'var(--marker-mint)',
  History: 'var(--marker-coral)',
  General: 'var(--marker-yellow)',
}

export function renderProgress(state) {
  const subjects = Array.from(new Set(state.tasks.map(t => t.subject)))
  const bySubject = subjects.map(subj => {
    const tasks = state.tasks.filter(t => t.subject === subj)
    const done = tasks.filter(t => t.status === 'done').length
    return { label: subj, value: tasks.length ? Math.round((done / tasks.length) * 100) : 0, color: SUBJECT_COLORS[subj] || 'var(--marker-yellow)' }
  })

  const todo = state.tasks.filter(t => t.status === 'todo').length
  const doing = state.tasks.filter(t => t.status === 'doing').length
  const done = state.tasks.filter(t => t.status === 'done').length
  const total = state.tasks.length
  const donutSegments = [
    { label: 'Done', value: done, color: 'var(--marker-mint)' },
    { label: 'In progress', value: doing, color: 'var(--marker-yellow)' },
    { label: 'To do', value: todo, color: 'var(--ink-600)' },
  ]

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Progress</div>
        <h1 class="page-title">How the week is actually going</h1>
        <p class="page-sub">Ask your agent "what are my weak areas?" and it'll read straight from this page.</p>
      </header>

      <div class="grid-3" style="margin-bottom:20px;">
        <div class="card"><div class="stat-pill"><span class="stat-value" style="color:var(--marker-yellow);">${state.streak}</span><span class="stat-label">day streak</span></div></div>
        <div class="card"><div class="stat-pill"><span class="stat-value" style="color:var(--marker-mint);">${state.xp}</span><span class="stat-label">XP earned</span></div></div>
        <div class="card"><div class="stat-pill"><span class="stat-value" style="color:var(--marker-coral);">${done}/${total}</span><span class="stat-label">tasks done</span></div></div>
      </div>

      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <h3 style="margin-bottom:16px;">Task status</h3>
          ${renderDonutChart(donutSegments, { centerLabel: `${total ? Math.round((done / total) * 100) : 0}%`, centerSub: 'complete' })}
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px;">Completion by subject</h3>
          ${bySubject.length ? renderBarChart(bySubject) : `<p style="color:var(--paper-dim); font-size:var(--text-sm);">No subjects yet.</p>`}
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin-bottom:16px;">Weak areas</h3>
          ${state.weak_areas.length === 0
            ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">None flagged yet — they show up here after a quiz slip-up.</p>`
            : `<div style="display:flex; flex-wrap:wrap; gap:8px;">${state.weak_areas.map(w => `<span class="badge badge-coral">${escapeHtml(w)}</span>`).join('')}</div>`}
        </div>

        <div class="card">
          <h3 style="margin-bottom:16px;">Badges</h3>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            ${state.badges.length === 0
              ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">Complete tasks and quizzes to unlock badges.</p>`
              : state.badges.map(b => `<span class="badge badge-yellow">★ ${escapeHtml(b)}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `
}
