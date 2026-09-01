export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}

function radialRing(pct, size = 96, thickness = 9, color = 'var(--marker-yellow)') {
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--ink-700)" stroke-width="${thickness}" />
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${thickness}"
        stroke-dasharray="${dash} ${c - dash}" stroke-linecap="round"
        transform="rotate(-90 ${size / 2} ${size / 2})" />
      <text x="${size / 2}" y="${size / 2 + 6}" text-anchor="middle" font-family="var(--font-display)" font-size="20" font-weight="700" fill="var(--paper)">${Math.round(pct)}%</text>
    </svg>
  `
}

export function renderDashboard(state) {
  const doneCount = state.tasks.filter(t => t.status === 'done').length
  const total = state.tasks.length
  const pct = total ? (doneCount / total) * 100 : 0
  const todayTasks = state.tasks.filter(t => t.status !== 'done').slice(0, 4)
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return `
    <div>
      <header class="card" style="display:flex; align-items:center; justify-content:space-between; gap:24px; margin-bottom:20px; background:linear-gradient(135deg, var(--ink-800), var(--ink-700)); flex-wrap:wrap;">
        <div>
          <div class="page-eyebrow">${greeting}</div>
          <h1 class="page-title" style="margin-bottom:6px;">Here's where things stand</h1>
          <p class="page-sub">Your board, shared with your agent — anything it does here shows up the same way your own edits do.</p>
          <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
            <button class="btn btn-primary btn-sm" data-nav="tasks">+ Add a task</button>
            <button class="btn btn-ghost btn-sm" data-nav="quiz">Build a quiz</button>
            <button class="btn btn-ghost btn-sm" data-nav="focus">Start focus</button>
          </div>
        </div>
        <div style="text-align:center; flex-shrink:0;">
          ${radialRing(pct, 100, 10, 'var(--marker-mint)')}
          <div style="font-size:var(--text-xs); color:var(--paper-dim); margin-top:6px;">tasks complete</div>
        </div>
      </header>

      <div class="grid-3" style="margin-bottom:20px;">
        <div class="card" style="border-left:3px solid var(--marker-yellow);">
          <div class="stat-pill"><span class="stat-value" style="color:var(--marker-yellow);">${state.streak}</span><span class="stat-label">day streak</span></div>
        </div>
        <div class="card" style="border-left:3px solid var(--marker-mint);">
          <div class="stat-pill"><span class="stat-value" style="color:var(--marker-mint);">${state.xp}</span><span class="stat-label">XP earned</span></div>
        </div>
        <div class="card" style="border-left:3px solid var(--marker-coral);">
          <div class="stat-pill"><span class="stat-value" style="color:var(--marker-coral);">${doneCount}/${total}</span><span class="stat-label">tasks done</span></div>
        </div>
      </div>

      <div class="grid-2">
        <div class="card">
          <h3 style="margin-bottom:14px;">Up next</h3>
          ${todayTasks.length === 0
            ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">Nothing pending — add a task or ask your agent to plan your week.</p>`
            : todayTasks.map(t => `
              <div class="task-card priority-${t.priority}" style="cursor:default;">
                <div class="task-card-title">${escapeHtml(t.title)}</div>
                <div class="task-card-meta">${escapeHtml(t.subject)} · ${escapeHtml(t.due)}</div>
              </div>`).join('')}
          <button class="btn btn-ghost btn-sm" data-nav="tasks" style="margin-top:4px;">View task board</button>
        </div>

        <div class="card">
          <h3 style="margin-bottom:14px;">Agent activity</h3>
          ${state.agent_log.length === 0
            ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">Nothing yet — type a request in the bar below, like "build a quiz on cell biology."</p>`
            : state.agent_log.slice(0, 5).map(entry => `
              <div class="card-tight" style="margin-bottom:8px; background:var(--ink-700); display:flex; align-items:center; gap:8px;">
                <span style="width:6px; height:6px; border-radius:50%; background:var(--marker-mint); flex-shrink:0;"></span>
                <p style="font-size:var(--text-sm);">${escapeHtml(entry.text)}</p>
              </div>`).join('')}
        </div>
      </div>

      ${state.badges.length > 0 ? `
        <div class="card" style="margin-top:20px;">
          <h3 style="margin-bottom:12px;">Badges</h3>
          <div style="display:flex; flex-wrap:wrap; gap:8px;">
            ${state.badges.map(b => `<span class="badge badge-yellow">★ ${escapeHtml(b)}</span>`).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `
}

export function attachDashboard(root, ctx) {
  root.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => ctx.setTab(btn.dataset.nav))
  })
}
