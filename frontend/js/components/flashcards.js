import { api } from '../api.js'
import { refresh } from '../state.js'
import { escapeHtml } from './dashboard.js'

let activeSetId = null
let flipped = {}

export function renderFlashcards(state) {
  const sets = state.flashcard_sets
  if (!activeSetId && sets.length) activeSetId = sets[0].id
  const currentSet = sets.find(s => s.id === activeSetId) || sets[0]

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Flashcards</div>
        <h1 class="page-title">Quick recall, one card at a time</h1>
        <p class="page-sub">Tap a card to flip it. Ask your agent to build a set for any topic.</p>
      </header>

      <form id="fc-form" class="card" style="display:flex; gap:10px; margin-bottom:24px;">
        <input id="fc-topic" class="input" style="flex:1;" placeholder="Topic, e.g. French Revolution causes" />
        <button class="btn btn-primary btn-sm" type="submit">Generate cards</button>
      </form>

      ${sets.length === 0 ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">No flashcard sets yet — generate one above.</p>` : ''}

      ${sets.length > 0 ? `
        <div style="display:flex; gap:8px; margin-bottom:16px; flex-wrap:wrap;">
          ${sets.map(s => `<button class="btn btn-sm ${currentSet && currentSet.id === s.id ? 'btn-primary' : 'btn-ghost'}" data-set="${s.id}">${escapeHtml(s.topic)}</button>`).join('')}
        </div>
        ${currentSet ? `
          <div class="grid-2">
            ${currentSet.cards.map((card, i) => `
              <div class="flip-card ${flipped[i] ? 'flipped' : ''}" data-idx="${i}">
                <div class="flip-card-inner">
                  <div class="flip-face flip-front">${escapeHtml(card.front)}</div>
                  <div class="flip-face flip-back">${escapeHtml(card.back)}</div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
      ` : ''}
    </div>
  `
}

export function attachFlashcards(root, rerender) {
  const form = root.querySelector('#fc-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const topic = root.querySelector('#fc-topic').value.trim()
    if (!topic) return
    const deck = await api.addFlashcards(topic, false)
    activeSetId = deck.id
    flipped = {}
    await refresh()
  })

  root.querySelectorAll('[data-set]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSetId = btn.dataset.set
      flipped = {}
      rerender()
    })
  })

  root.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = card.dataset.idx
      flipped[idx] = !flipped[idx]
      rerender()
    })
  })
}
