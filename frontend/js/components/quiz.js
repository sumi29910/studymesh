import { api } from '../api.js'
import { refresh } from '../state.js'
import { escapeHtml } from './dashboard.js'
import { showQuoteToast } from './quotes.js'

let activeQuizId = null
let qIndex = 0
let selected = null
let score = 0

export function renderQuiz(state) {
  const quizzes = state.quizzes
  if (!activeQuizId && quizzes.length) activeQuizId = quizzes[0].id
  const currentQuiz = quizzes.find(s => s.id === activeQuizId) || quizzes[0]
  const currentQ = currentQuiz?.questions[qIndex]

  return `
    <div>
      <header class="page-header">
        <div class="page-eyebrow">Quiz zone</div>
        <h1 class="page-title">Test yourself, get instant feedback</h1>
        <p class="page-sub">Wrong answers quietly feed your weak-areas list on the Progress page.</p>
      </header>

      <form id="quiz-form" class="card" style="display:flex; gap:10px; margin-bottom:24px;">
        <input id="quiz-topic" class="input" style="flex:1;" placeholder="Topic, e.g. Cell Biology" />
        <button class="btn btn-primary btn-sm" type="submit">Build quiz</button>
      </form>

      ${quizzes.length === 0 ? `<p style="color:var(--paper-dim); font-size:var(--text-sm);">No quizzes yet — build one above.</p>` : ''}

      ${currentQuiz && currentQ ? `
        <div class="card">
          <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
            <span class="badge badge-yellow">${escapeHtml(currentQuiz.topic)}</span>
            <span style="font-size:var(--text-xs); color:var(--paper-dim);">Question ${qIndex + 1} of ${currentQuiz.questions.length} · Score ${score}</span>
          </div>
          <h3 style="margin-bottom:16px; font-size:var(--text-lg);">${escapeHtml(currentQ.q)}</h3>
          ${currentQ.options.map((opt, i) => {
            let cls = 'quiz-option'
            if (selected !== null) {
              if (i === currentQ.correct_index) cls += ' correct'
              else if (i === selected) cls += ' incorrect'
            }
            return `<button class="${cls}" data-opt="${i}" ${selected !== null ? 'disabled' : ''}>${escapeHtml(opt)}</button>`
          }).join('')}
          ${selected !== null && qIndex < currentQuiz.questions.length - 1 ? `<button class="btn btn-primary btn-sm" id="quiz-next" style="margin-top:8px;">Next question</button>` : ''}
          ${selected !== null && qIndex === currentQuiz.questions.length - 1 ? `<p style="margin-top:12px; font-size:var(--text-sm); color:var(--marker-mint);">Quiz complete — ${score}/${currentQuiz.questions.length} correct.</p>` : ''}
        </div>
      ` : ''}
    </div>
  `
}

export function attachQuiz(root, state, rerender) {
  const form = root.querySelector('#quiz-form')
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const topic = root.querySelector('#quiz-topic').value.trim()
    if (!topic) return
    const quiz = await api.addQuiz(topic, false)
    activeQuizId = quiz.id
    qIndex = 0; selected = null; score = 0
    await refresh()
  })

  root.querySelectorAll('[data-opt]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (selected !== null) return
      const idx = parseInt(btn.dataset.opt, 10)
      const quiz = state.quizzes.find(s => s.id === activeQuizId)
      selected = idx
      const result = await api.answerQuiz(quiz.id, qIndex, idx)
      if (result.correct) score += 1
      const isLastQuestion = qIndex === quiz.questions.length - 1
      await refresh()
      if (isLastQuestion) {
        showQuoteToast('quiz', `Quiz complete — ${score}/${quiz.questions.length}`)
      }
    })
  })

  const nextBtn = root.querySelector('#quiz-next')
  if (nextBtn) nextBtn.addEventListener('click', () => {
    selected = null
    qIndex += 1
    rerender()
  })
}
