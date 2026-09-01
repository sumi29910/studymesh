import { api } from '../api.js'
import { refresh } from '../state.js'
import { escapeHtml } from './dashboard.js'
import { showQuoteToast } from './quotes.js'

const COLUMNS = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export function renderTasks(state) {
  const byStatus = (status) => state.tasks.filter(t => t.status === status)

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Task board</div>
        <h1 class="page-title">Plan and track your study tasks</h1>
        <p class="page-sub">Drag a card to move it — or ask your agent to reprioritize the whole board.</p>
      </header>

      <form id="task-form" class="card" style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:24px;">
        <input id="task-title" class="input" style="flex:2 1 220px;" placeholder="New task, e.g. Revise Organic Chemistry" />
        <input id="task-subject" class="input" style="flex:1 1 120px;" placeholder="Subject" />
        <select id="task-priority" class="input">
          <option value="low">Low priority</option>
          <option value="med" selected>Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <button class="btn btn-primary btn-sm" type="submit">Add task</button>
      </form>

      <div class="board">
        ${COLUMNS.map(col => `
          <div>
            <div class="board-col-title">${col.label} <span class="board-col-count">${byStatus(col.id).length}</span></div>
            <div class="board-col-drop" data-col="${col.id}">
              ${byStatus(col.id).map(task => `
                <div class="task-card priority-${task.priority}" draggable="true" data-id="${task.id}">
                  <div class="task-card-title">${escapeHtml(task.title)}</div>
                  <div class="task-card-meta">${escapeHtml(task.subject)} · ${escapeHtml(task.due)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

export function attachTasks(root) {
  const form = root.querySelector('#task-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const title = root.querySelector('#task-title').value.trim()
    if (!title) return
    const subject = root.querySelector('#task-subject').value.trim() || 'General'
    const priority = root.querySelector('#task-priority').value
    await api.addTask({ title, subject, priority, due: 'This week', by_agent: false })
    await refresh()
  })

  let draggingId = null
  root.querySelectorAll('.task-card').forEach(card => {
    card.addEventListener('dragstart', () => {
      draggingId = card.dataset.id
      card.classList.add('dragging')
    })
    card.addEventListener('dragend', () => card.classList.remove('dragging'))
  })

  root.querySelectorAll('.board-col-drop').forEach(col => {
    col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over') })
    col.addEventListener('dragleave', () => col.classList.remove('drag-over'))
    col.addEventListener('drop', async () => {
      col.classList.remove('drag-over')
      if (draggingId) {
        await api.moveTask(draggingId, col.dataset.col)
        await refresh()
        if (col.dataset.col === 'done') {
          showQuoteToast('task', 'Task complete')
        }
        draggingId = null
      }
    })
  })
}
