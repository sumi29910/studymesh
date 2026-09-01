const BASE = '/api'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`${path} failed: ${res.status} ${detail}`)
  }
  return res.json()
}

export const api = {
  getState: () => request('/state'),
  getProgress: () => request('/progress'),

  addTask: (body) => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  moveTask: (id, status) => request(`/tasks/${id}/move`, { method: 'POST', body: JSON.stringify({ status }) }),
  rescheduleTasks: (body) => request('/tasks/reschedule', { method: 'POST', body: JSON.stringify(body) }),

  addAlarm: (time, subject, note, byAgent = false) => request('/alarms', { method: 'POST', body: JSON.stringify({ time, subject, note, by_agent: byAgent }) }),
  fireAlarm: (id) => request(`/alarms/${id}/fire`, { method: 'POST' }),
  cancelAlarm: (id) => request(`/alarms/${id}/cancel`, { method: 'POST' }),

  addFlashcards: (topic, byAgent = false) => request('/flashcards', { method: 'POST', body: JSON.stringify({ topic, by_agent: byAgent }) }),
  addQuiz: (topic, byAgent = false) => request('/quiz', { method: 'POST', body: JSON.stringify({ topic, by_agent: byAgent }) }),
  answerQuiz: (quizId, questionIndex, selectedIndex) =>
    request(`/quiz/${quizId}/answer`, { method: 'POST', body: JSON.stringify({ question_index: questionIndex, selected_index: selectedIndex }) }),

  startFocus: (minutes, subject, byAgent = false) =>
    request('/focus/start', { method: 'POST', body: JSON.stringify({ minutes, subject, by_agent: byAgent }) }),
  stopFocus: () => request('/focus/stop', { method: 'POST' }),
}
