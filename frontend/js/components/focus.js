import { api } from '../api.js'
import { refresh } from '../state.js'

function format(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function renderFocus(state) {
  const focus = state.focus
  const pct = focus.duration_seconds ? Math.round(((focus.duration_seconds - focus.remaining_seconds) / focus.duration_seconds) * 100) : 0

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Focus session</div>
        <h1 class="page-title">One task, one timer, no distractions</h1>
        <p class="page-sub">Ask your agent to start a session — "give me 45 minutes for Physics" works too.</p>
      </header>

      <div class="card" style="max-width:440px;">
        ${!focus.active ? `
          <form id="focus-form" style="display:flex; flex-direction:column; gap:12px;">
            <label style="font-size:var(--text-sm); color:var(--paper-dim);">
              Subject
              <input id="focus-subject" class="input" style="width:100%; margin-top:6px;" placeholder="e.g. Organic Chemistry" />
            </label>
            <label style="font-size:var(--text-sm); color:var(--paper-dim);">
              Minutes
              <input id="focus-minutes" type="number" min="5" max="120" value="25" class="input" style="width:100%; margin-top:6px;" />
            </label>
            <button class="btn btn-primary" type="submit">Start session</button>
          </form>
        ` : `
          <div style="text-align:center;">
            <p style="color:var(--paper-dim); font-size:var(--text-sm); margin-bottom:8px;">${focus.subject}</p>
            <div class="timer-ring-wrap"><span class="timer-value">${format(focus.remaining_seconds)}</span></div>
            <div class="progress-track" style="margin-bottom:16px;"><div class="progress-fill" style="width:${pct}%; background:var(--marker-yellow);"></div></div>
            <button class="btn btn-ghost btn-sm" id="focus-stop">End session</button>
          </div>
        `}
      </div>
    </div>
  `
}

export function attachFocus(root) {
  const form = root.querySelector('#focus-form')
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      const subject = root.querySelector('#focus-subject').value.trim() || 'Study'
      const minutes = parseInt(root.querySelector('#focus-minutes').value, 10) || 25
      await api.startFocus(minutes, subject, false)
      await refresh()
    })
  }
  const stopBtn = root.querySelector('#focus-stop')
  if (stopBtn) {
    stopBtn.addEventListener('click', async () => {
      await api.stopFocus()
      await refresh()
    })
  }
}
