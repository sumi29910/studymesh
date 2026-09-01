import { api } from './api.js'
import { refresh } from './state.js'

// These are the actions both the WebMCP tools AND the in-app "Ask agent" bar
// call — one action layer, two entry points (a real agent, or a human
// typing). Every action hits the same Python backend endpoints the rest of
// the UI uses, so there's a single source of truth on the server.
export function createAgentActions() {
  return {
    add_study_task: async ({ title, subject, priority, due }) => {
      const task = await api.addTask({ title, subject, priority, due, by_agent: true })
      await refresh()
      return { ok: true, message: `Added "${task.title}" to the task board.` }
    },

    reschedule_tasks: async ({ task_ids, due_label, priority }) => {
      const result = await api.rescheduleTasks({ task_ids: task_ids || null, due_label, priority: priority || null })
      await refresh()
      return { ok: true, message: `Rescheduled ${result.count} task(s) — ${due_label}.` }
    },

    set_alarm: async ({ time, subject, note }) => {
      const alarm = await api.addAlarm(time, subject || 'Study', note || '', true)
      await refresh()
      return { ok: true, message: `Set an alarm for ${alarm.time} — ${alarm.subject}.` }
    },

    generate_flashcards: async ({ topic }) => {
      const deck = await api.addFlashcards(topic, true)
      await refresh()
      return { ok: true, message: `Generated ${deck.cards.length} flashcards on ${topic}.` }
    },

    generate_quiz: async ({ topic }) => {
      const quiz = await api.addQuiz(topic, true)
      await refresh()
      return { ok: true, message: `Built a ${quiz.questions.length}-question quiz on ${topic}.` }
    },

    start_focus_session: async ({ minutes, subject }) => {
      await api.startFocus(minutes || 25, subject || 'Study', true)
      await refresh()
      return { ok: true, message: `Started a ${minutes || 25}-min focus session for ${subject || 'study'}.` }
    },

    track_progress: async () => {
      const summary = await api.getProgress()
      const weak = summary.weak_areas.length ? summary.weak_areas.join(', ') : 'none flagged yet'
      return {
        ok: true,
        message: `${summary.done}/${summary.total} tasks done. XP: ${summary.xp}. Streak: ${summary.streak} days. Weak areas: ${weak}.`,
      }
    },
  }
}

// Registers tools on document.modelContext when a WebMCP-capable host is
// present (WebMCP-enabled Chrome, or an agent's in-app browser). No-ops
// safely otherwise, so the app still works as a normal human-facing site.
export function registerWebMCPTools(actions) {
  if (typeof document === 'undefined' || !document.modelContext || !document.modelContext.registerTool) {
    return { supported: false }
  }

  const specs = [
    {
      name: 'add_study_task',
      description: 'Add a new study task to the board with a subject, priority, and due label.',
      inputSchema: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'What the task is, e.g. "Revise Thermodynamics ch.4"' },
          subject: { type: 'string', description: 'Subject/course this task belongs to' },
          priority: { type: 'string', enum: ['low', 'med', 'high'] },
          due: { type: 'string', description: 'Human-readable due label, e.g. "Tomorrow"' },
        },
        required: ['title'],
      },
      execute: async (input) => actions.add_study_task(input),
    },
    {
      name: 'reschedule_tasks',
      description: 'Reschedule some or all open tasks — e.g. because an exam date moved.',
      inputSchema: {
        type: 'object',
        properties: {
          task_ids: { type: 'array', items: { type: 'string' }, description: 'Task ids to reschedule. Omit to affect all open tasks.' },
          due_label: { type: 'string', description: 'New due label to apply, e.g. "In 5 days"' },
          priority: { type: 'string', enum: ['low', 'med', 'high'] },
        },
        required: ['due_label'],
      },
      execute: async (input) => actions.reschedule_tasks(input),
    },
    {
      name: 'set_alarm',
      description: 'Set a study alarm for a specific time today (or tomorrow if that time already passed today).',
      inputSchema: {
        type: 'object',
        properties: {
          time: { type: 'string', description: '24-hour time in HH:MM format, e.g. "18:30"' },
          subject: { type: 'string', description: 'Subject/course this alarm is for' },
          note: { type: 'string', description: 'Optional short note, e.g. "Revise ch.4"' },
        },
        required: ['time'],
      },
      execute: async (input) => actions.set_alarm(input),
    },
    {
      name: 'generate_flashcards',
      description: 'Generate a set of flip flashcards for a study topic.',
      inputSchema: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'] },
      execute: async (input) => actions.generate_flashcards(input),
    },
    {
      name: 'generate_quiz',
      description: 'Generate a short multiple-choice quiz for a study topic.',
      inputSchema: { type: 'object', properties: { topic: { type: 'string' } }, required: ['topic'] },
      execute: async (input) => actions.generate_quiz(input),
    },
    {
      name: 'start_focus_session',
      description: 'Start a Pomodoro-style focus timer for a subject.',
      inputSchema: {
        type: 'object',
        properties: { minutes: { type: 'number', description: 'Session length in minutes' }, subject: { type: 'string' } },
        required: [],
      },
      execute: async (input) => actions.start_focus_session(input),
    },
    {
      name: 'track_progress',
      description: 'Get a summary of task completion, XP, streak, and weak topics.',
      inputSchema: { type: 'object', properties: {} },
      execute: async () => actions.track_progress(),
    },
  ]

  specs.forEach((spec) => document.modelContext.registerTool(spec))
  return { supported: true, count: specs.length }
}
