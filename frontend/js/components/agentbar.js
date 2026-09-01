function extractAlarmTime(text) {
  const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
  if (!match) return null
  let hour = parseInt(match[1], 10)
  const minute = match[2] ? parseInt(match[2], 10) : 0
  const meridiem = match[3] ? match[3].toLowerCase() : null
  if (meridiem === 'pm' && hour < 12) hour += 12
  if (meridiem === 'am' && hour === 12) hour = 0
  if (hour > 23 || minute > 59) return null
  return { time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, matched: match[0] }
}

function parseCommand(text) {
  const t = text.toLowerCase().trim()
  const topicAfter = (keyword) => {
    const idx = t.indexOf(keyword)
    if (idx === -1) return null
    const rest = text.slice(idx + keyword.length).trim()
    return rest.replace(/^(on|for|about)\s+/i, '').replace(/\.$/, '') || 'this topic'
  }

  if (t.includes('alarm')) {
    const parsed = extractAlarmTime(text)
    if (parsed) {
      const remainder = text
        .replace(parsed.matched, '')
        .replace(/set (an |a )?alarm/i, '')
        .replace(/^\s*(for|at|to)\s+/i, '')
        .replace(/\.$/, '')
        .trim()
      return { tool: 'set_alarm', args: { time: parsed.time, subject: remainder || 'Study', note: '' } }
    }
    return { tool: 'set_alarm', args: { time: '18:00', subject: 'Study', note: '' } }
  }
  if (t.includes('flashcard')) return { tool: 'generate_flashcards', args: { topic: topicAfter('flashcard') || 'your topic' } }
  if (t.includes('quiz')) return { tool: 'generate_quiz', args: { topic: topicAfter('quiz') || 'your topic' } }
  if (t.includes('focus') || t.includes('pomodoro') || t.includes('timer')) {
    const minMatch = t.match(/(\d+)\s*min/)
    const subj = topicAfter('for') || topicAfter('focus')
    return { tool: 'start_focus_session', args: { minutes: minMatch ? parseInt(minMatch[1], 10) : 25, subject: subj || 'Study' } }
  }
  if (t.includes('reschedul') || t.includes('replan')) return { tool: 'reschedule_tasks', args: { due_label: 'Reprioritized by agent' } }
  if (t.includes('progress') || t.includes('weak')) return { tool: 'track_progress', args: {} }
  if (t.includes('task') || t.includes('add ') || t.includes('remind')) return { tool: 'add_study_task', args: { title: text, subject: 'General', priority: 'med' } }
  return null
}

export function renderAgentBar(lastReply) {
  return `
    <div class="agent-bar-wrap">
      <div style="width:100%; max-width:720px;">
        ${lastReply ? `<div class="agent-log"><span class="badge badge-mint" style="margin-right:8px;">Agent</span>${lastReply}</div>` : ''}
        <form class="agent-bar" id="agent-form">
          <span class="agent-bar-dot" id="agent-dot" aria-hidden="true"></span>
          <input id="agent-input" placeholder='Ask the agent — try "set an alarm for 6pm to revise physics"' aria-label="Ask the agent to act on your board" autocomplete="off" />
          <button type="submit" class="btn btn-primary btn-sm" id="agent-submit">Send</button>
        </form>
      </div>
    </div>
  `
}

export function attachAgentBar(root, actions, onDone) {
  const form = root.querySelector('#agent-form')
  const input = root.querySelector('#agent-input')
  const dot = root.querySelector('#agent-dot')
  const submitBtn = root.querySelector('#agent-submit')

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const value = input.value.trim()
    if (!value) return
    dot.classList.add('busy')
    submitBtn.disabled = true
    submitBtn.textContent = 'Working…'
    await new Promise(r => setTimeout(r, 450))

    const command = parseCommand(value)
    let reply = "I can add tasks, set an alarm, build flashcards/quizzes, start a focus session, or check your progress — try one of those."
    if (command && actions[command.tool]) {
      const result = await actions[command.tool](command.args)
      reply = result?.message || 'Done.'
    }
    onDone(reply)
  })
}
