import { refresh, subscribe, getCached } from './state.js'
import { api } from './api.js'
import { createAgentActions, registerWebMCPTools } from './mcp.js'
import { renderSidebar } from './components/sidebar.js'
import { renderAgentBar, attachAgentBar } from './components/agentbar.js'
import { renderDashboard, attachDashboard } from './components/dashboard.js'
import { renderTasks, attachTasks } from './components/tasks.js'
import { renderAlarms, attachAlarms } from './components/alarms.js'
import { renderFlashcards, attachFlashcards } from './components/flashcards.js'
import { renderQuiz, attachQuiz } from './components/quiz.js'
import { renderFocus, attachFocus } from './components/focus.js'
import { renderProgress } from './components/progress.js'
import { showQuoteToast, showAlarmToast, requestNotificationPermission } from './components/quotes.js'

const root = document.getElementById('app-root')
const actions = createAgentActions()

let activeTab = 'dashboard'
let lastAgentReply = null
let prevState = null
const firingInProgress = new Set()

// Compares the previous and new shared state to notice moments worth
// celebrating — a focus session finishing naturally, or crossing a 2-hour
// cumulative study milestone — and pops a motivational quote for them.
function detectMilestones(newState) {
  if (prevState) {
    const focusJustCompleted = prevState.focus.active && !newState.focus.active && (prevState.focus.remaining_seconds ?? 1) <= 1
    if (focusJustCompleted) {
      showQuoteToast('focus', `Focus session complete — ${prevState.focus.subject || 'Study'}`)
    }

    const prevHours = Math.floor((prevState.total_focus_seconds || 0) / 7200)
    const newHours = Math.floor((newState.total_focus_seconds || 0) / 7200)
    if (newHours > prevHours) {
      showQuoteToast('milestone', `${newHours * 2}+ hours focused today`)
    }
  }
  prevState = newState
}

// Checks pending alarms against the current time every second. Firing an
// alarm is a real state change (marked on the server so it doesn't re-fire
// on refresh or across tabs), then shows the popup + beep + notification.
async function checkAlarms() {
  const state = getCached()
  if (!state || !state.alarms) return
  const now = Date.now() / 1000
  for (const alarm of state.alarms) {
    if (!alarm.fired && alarm.trigger_time <= now && !firingInProgress.has(alarm.id)) {
      firingInProgress.add(alarm.id)
      try {
        await api.fireAlarm(alarm.id)
        await refresh()
        showAlarmToast(alarm.subject, alarm.note)
      } catch (e) {
        // Already fired by another tab/poll — ignore.
      } finally {
        firingInProgress.delete(alarm.id)
      }
    }
  }
}

function setTab(tab) {
  activeTab = tab
  render()
}

function renderSection(state) {
  switch (activeTab) {
    case 'tasks': return renderTasks(state)
    case 'alarms': return renderAlarms(state)
    case 'flashcards': return renderFlashcards(state)
    case 'quiz': return renderQuiz(state)
    case 'focus': return renderFocus(state)
    case 'progress': return renderProgress(state)
    default: return renderDashboard(state, setTab)
  }
}

function attachSection(mainEl, state) {
  switch (activeTab) {
    case 'tasks': return attachTasks(mainEl)
    case 'alarms': return attachAlarms(mainEl)
    case 'flashcards': return attachFlashcards(mainEl, render)
    case 'quiz': return attachQuiz(mainEl, state, render)
    case 'focus': return attachFocus(mainEl)
    case 'progress': return undefined
    default: return attachDashboard(mainEl, { setTab })
  }
}

function render() {
  const state = getCached()
  if (!state) return

  root.innerHTML = `
    <div class="app-shell">
      ${renderSidebar(activeTab)}
      <main class="main" id="main-section">${renderSection(state)}</main>
      ${renderAgentBar(lastAgentReply)}
    </div>
  `

  root.querySelectorAll('.sidebar-tab').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.tab))
  })

  attachSection(root.querySelector('#main-section'), state)

  attachAgentBar(root, actions, (reply) => {
    lastAgentReply = reply
    render()
  })
}

async function init() {
  await refresh()
  prevState = getCached()
  subscribe(detectMilestones)
  subscribe(() => render())
  render()

  requestNotificationPermission()

  const result = registerWebMCPTools(actions)
  if (result.supported) {
    console.log(`StudyMesh: registered ${result.count} WebMCP tools on document.modelContext`)
  } else {
    console.log('StudyMesh: no WebMCP host detected — running in human-only mode. The Agent bar below still exercises the same actions locally.')
  }

  // Keep the focus timer's remaining time in sync with the server while a
  // session is running (the server derives it from wall-clock time), and
  // check alarms every second so they fire close to on time.
  setInterval(async () => {
    const state = getCached()
    if (state && state.focus.active) await refresh()
    await checkAlarms()
  }, 1000)
}

init()
