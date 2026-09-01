const QUOTES = {
  quiz: [
    { text: "Small wins compound — that quiz just made tomorrow's revision easier.", author: "" },
    { text: "You showed up and tested yourself. That's how mastery is built.", author: "" },
    { text: "Every question answered is a little more clarity in your head.", author: "" },
    { text: "Mistakes on a quiz are cheaper than mistakes on the exam. Good trade.", author: "" },
  ],
  focus: [
    { text: "That's a full session of undivided attention — most people can't say that today.", author: "" },
    { text: "Deep work isn't glamorous, but it's exactly what you just did.", author: "" },
    { text: "One focused session at a time is how big syllabi actually get finished.", author: "" },
    { text: "You just protected your attention for a whole session. That's a real skill.", author: "" },
  ],
  milestone: [
    { text: "Two hours of real focus in a day — that's more than most people manage in a week of trying.", author: "" },
    { text: "\"It always seems impossible until it's done.\"", author: "Nelson Mandela" },
    { text: "\"The secret of getting ahead is getting started.\"", author: "Mark Twain" },
    { text: "You've earned a proper break. Come back to it refreshed.", author: "" },
  ],
  task: [
    { text: "One task closer to done. Keep the chain going.", author: "" },
    { text: "\"Well begun is half done.\" — you're doing more than beginning today.", author: "Aristotle" },
  ],
}

function pick(category) {
  const pool = QUOTES[category] || QUOTES.quiz
  return pool[Math.floor(Math.random() * pool.length)]
}

let toastTimer = null

export function showQuoteToast(category, heading) {
  const quote = pick(category)
  let wrap = document.getElementById('quote-toast-wrap')
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.id = 'quote-toast-wrap'
    wrap.className = 'quote-toast-wrap'
    document.body.appendChild(wrap)
  }

  wrap.innerHTML = `
    <div class="quote-toast" role="status">
      <div class="quote-toast-heading">${heading}</div>
      <p class="quote-toast-text">${quote.text}</p>
      ${quote.author ? `<div class="quote-toast-author">— ${quote.author}</div>` : ''}
      <button class="quote-toast-close" aria-label="Dismiss">×</button>
    </div>
  `
  wrap.classList.add('show')

  const closeBtn = wrap.querySelector('.quote-toast-close')
  const dismiss = () => wrap.classList.remove('show')
  closeBtn.addEventListener('click', dismiss)

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(dismiss, 6000)
}

// A short, dependency-free beep using the Web Audio API — no external
// sound file needed. Plays two quick tones so it reads as an "alarm", not
// a generic notification chime.
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const playTone = (delay) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(ctx.currentTime + delay)
      osc.stop(ctx.currentTime + delay + 0.3)
    }
    playTone(0)
    playTone(0.35)
  } catch (e) {
    // Audio not available in this environment — fail silently.
  }
}

export function requestNotificationPermission() {
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {})
  }
}

// Shown when a study alarm goes off — distinct from the motivational
// quote toast (coral accent, no auto-dismiss timer cap as short, plays a
// beep, and also fires a native browser notification if permitted).
export function showAlarmToast(subject, note) {
  playBeep()

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(`⏰ ${subject}`, { body: note || 'Your study alarm just went off.' })
    } catch (e) {
      // Some browsers restrict Notification outside a user gesture — ignore.
    }
  }

  let wrap = document.getElementById('quote-toast-wrap')
  if (!wrap) {
    wrap = document.createElement('div')
    wrap.id = 'quote-toast-wrap'
    wrap.className = 'quote-toast-wrap'
    document.body.appendChild(wrap)
  }

  wrap.innerHTML = `
    <div class="quote-toast alarm-toast" role="alert">
      <div class="quote-toast-heading" style="color:var(--marker-coral);">⏰ Alarm — ${subject}</div>
      <p class="quote-toast-text">${note || 'Time to get back to it.'}</p>
      <button class="quote-toast-close" aria-label="Dismiss">×</button>
    </div>
  `
  wrap.classList.add('show')

  const closeBtn = wrap.querySelector('.quote-toast-close')
  const dismiss = () => wrap.classList.remove('show')
  closeBtn.addEventListener('click', dismiss)

  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(dismiss, 10000)
}
