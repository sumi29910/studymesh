import { api } from '../api.js'
import { refresh } from '../state.js'
import { escapeHtml } from './dashboard.js'

export function renderAlarms(state) {
  const alarms = [...state.alarms].sort((a, b) => a.trigger_time - b.trigger_time)
  const upcoming = alarms.filter(a => !a.fired)
  const past = alarms.filter(a => a.fired)

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Alarms</div>
        <h1 class="page-title">Set a study alarm, get reminded when it matters</h1>
        <p class="page-sub">Ask your agent — "set an alarm for 6pm to revise Physics" — or add one yourself below.</p>
      </header>

      <form id="alarm-form" class="card" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:24px;">
        <input id="alarm-time" type="time" class="input" style="flex:0 0 130px;" required />
        <input id="alarm-subject" class="input" style="flex:1 1 160px;" placeholder="Subject, e.g. Physics" />
        <input id="alarm-note" class="input" style="flex:2 1 220px;" placeholder="Note (optional), e.g. Revise ch.4" />
        <button class="btn btn-primary btn-sm" type="submit">Set alarm</button>
      </form>

      <h3 style="margin-bottom:12px;">Upcoming</h3>
      ${upcoming.length === 0
        ? `<p style="color:var(--paper-dim); font-size:var(--text-sm); margin-bottom:24px;">No alarms set — add one above.</p>`
        : `<div style="margin-bottom:24px;">${upcoming.map(a => `
            <div class="task-card priority-med" style="display:flex; align-items:center; justify-content:space-between; cursor:default;">
              <div>
                <div class="task-card-title">${escapeHtml(a.time)} — ${escapeHtml(a.subject)}</div>
                ${a.note ? `<div class="task-card-meta">${escapeHtml(a.note)}</div>` : ''}
              </div>
              <button class="btn btn-ghost btn-sm" data-cancel="${a.id}" aria-label="Cancel alarm">Cancel</button>
            </div>
          `).join('')}</div>`}

      ${past.length > 0 ? `
        <h3 style="margin-bottom:12px; color:var(--paper-dim);">Rang already</h3>
        <div>${past.slice(0, 6).map(a => `
          <div class="task-card" style="opacity:0.6; cursor:default;">
            <div class="task-card-title">${escapeHtml(a.time)} — ${escapeHtml(a.subject)}</div>
            ${a.note ? `<div class="task-card-meta">${escapeHtml(a.note)}</div>` : ''}
          </div>
        `).join('')}</div>
      ` : ''}
    </div>
  `
}

export function attachAlarms(root) {
  const form = root.querySelector('#alarm-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const time = root.querySelector('#alarm-time').value
    if (!time) return
    const subject = root.querySelector('#alarm-subject').value.trim() || 'Study'
    const note = root.querySelector('#alarm-note').value.trim()
    await api.addAlarm(time, subject, note, false)
    await refresh()
  })

  root.querySelectorAll('[data-cancel]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await api.cancelAlarm(btn.dataset.cancel)
      await refresh()
    })
  })
}
